// Direct Google Gemini API client. Replaces the Lovable AI gateway for Phase A
// of the migration. Rollback is DNS-level, so there is intentionally NO in-code
// kill switch here.
//
// Model IDs are centralised in ./ai-models.ts in gateway format (google/gemini-…).
// The direct generativelanguage API does NOT accept that vendor prefix, so we
// strip it here — the single source of truth stays unchanged, callers pass the
// same constants they always did.

const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function getApiKey(): string {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY not set");
  return key;
}

// Strips a leading google/ vendor prefix (gateway format) that the direct API rejects.
function normalizeModel(model: string): string {
  return model.replace(/^google\//, "");
}

type InlineImage = { base64: string; mimeType: string };

// Low-level call. Throws on non-2xx: 429 -> message contains "RATE_LIMIT" so
// callers can fall back; anything else -> "Gemini <status>: <message>".
async function callGemini(
  model: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<any> {
  const url = `${GEMINI_BASE}/${normalizeModel(model)}:generateContent?key=${getApiKey()}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    let errMsg = errText.slice(0, 500);
    try {
      const parsed = JSON.parse(errText);
      if (parsed?.error?.message) errMsg = parsed.error.message;
    } catch { /* keep raw text */ }
    if (resp.status === 429) {
      throw new Error(`RATE_LIMIT: Gemini 429: ${errMsg}`);
    }
    throw new Error(`Gemini ${resp.status}: ${errMsg}`);
  }

  return await resp.json();
}

/**
 * Generate an image. Returns the raw base64 string (NO "data:" prefix) of the
 * first inlineData part. Callers that need a data URL should wrap it themselves.
 * On 429 throws an error whose message contains "RATE_LIMIT".
 */
export async function generateImage(opts: {
  model: string;
  prompt: string;
  inputImages?: InlineImage[];
  signal?: AbortSignal;
}): Promise<string> {
  const { model, prompt, inputImages = [], signal } = opts;

  const parts: any[] = [{ text: prompt }];
  for (const img of inputImages) {
    parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
  }

  const data = await callGemini(
    model,
    {
      contents: [{ role: "user", parts }],
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
    },
    signal,
  );

  const respParts: any[] = data?.candidates?.[0]?.content?.parts ?? [];
  const imgPart = respParts.find((p) => p?.inlineData?.data);
  if (!imgPart) throw new Error("No image returned from Gemini");
  return imgPart.inlineData.data as string;
}

type TextMessage = { role: "user" | "model"; content: string; images?: InlineImage[] };

// Build Gemini `contents` from role/content(+optional images) messages.
function toContents(messages: TextMessage[]): any[] {
  return messages.map((m) => {
    const parts: any[] = [{ text: m.content }];
    for (const img of m.images ?? []) {
      parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
    }
    return { role: m.role, parts };
  });
}

function buildGenerationConfig(temperature?: number, maxOutputTokens?: number) {
  const cfg: Record<string, unknown> = {};
  if (typeof temperature === "number") cfg.temperature = temperature;
  if (typeof maxOutputTokens === "number") cfg.maxOutputTokens = maxOutputTokens;
  return cfg;
}

/**
 * Generate text. Messages may carry inline images (for vision analysis).
 * Returns the concatenated text of the first candidate.
 * On error throws with HTTP status + Gemini message.
 */
export async function generateText(opts: {
  model: string;
  systemPrompt?: string;
  messages: TextMessage[];
  temperature?: number;
  maxOutputTokens?: number;
  signal?: AbortSignal;
}): Promise<string> {
  const { model, systemPrompt, messages, temperature, maxOutputTokens, signal } = opts;

  const body: Record<string, unknown> = {
    contents: toContents(messages),
    generationConfig: buildGenerationConfig(temperature, maxOutputTokens),
  };
  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const data = await callGemini(model, body, signal);
  const parts: any[] = data?.candidates?.[0]?.content?.parts ?? [];
  return parts.filter((p) => typeof p?.text === "string").map((p) => p.text).join("");
}

/**
 * Generate with function-calling (structured output). `tools` are Gemini
 * functionDeclarations: { name, description, parameters }. Set toolConfig.mode
 * to "ANY" (+ allowedFunctionNames) to force a call, "AUTO" to let the model
 * choose (default). Returns the free text and the first functionCall (if any) —
 * `toolCall.args` is already a parsed object (NOT a JSON string).
 */
export async function generateWithTools(opts: {
  model: string;
  systemPrompt?: string;
  messages: TextMessage[];
  tools: Array<{ name: string; description?: string; parameters?: Record<string, unknown> }>;
  toolConfig?: { mode?: "AUTO" | "ANY" | "NONE"; allowedFunctionNames?: string[] };
  temperature?: number;
  signal?: AbortSignal;
}): Promise<{ text: string; toolCall: { name: string; args: Record<string, unknown> } | null }> {
  const { model, systemPrompt, messages, tools, toolConfig, temperature, signal } = opts;

  const body: Record<string, unknown> = {
    contents: toContents(messages),
    tools: [{ functionDeclarations: tools }],
    generationConfig: buildGenerationConfig(temperature),
  };
  if (systemPrompt) body.systemInstruction = { parts: [{ text: systemPrompt }] };
  if (toolConfig?.mode) {
    body.toolConfig = {
      functionCallingConfig: {
        mode: toolConfig.mode,
        ...(toolConfig.allowedFunctionNames
          ? { allowedFunctionNames: toolConfig.allowedFunctionNames }
          : {}),
      },
    };
  }

  const data = await callGemini(model, body, signal);
  const parts: any[] = data?.candidates?.[0]?.content?.parts ?? [];
  let text = "";
  let toolCall: { name: string; args: Record<string, unknown> } | null = null;
  for (const p of parts) {
    if (typeof p?.text === "string") text += p.text;
    if (p?.functionCall && !toolCall) {
      toolCall = { name: p.functionCall.name, args: p.functionCall.args ?? {} };
    }
  }
  return { text: text.trim(), toolCall };
}
