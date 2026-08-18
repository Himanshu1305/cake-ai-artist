// The ONLY place model IDs live. Update here, all functions follow.
// These are DIRECT generativelanguage.googleapis.com model names — no "google/"
// vendor prefix (that was the Lovable gateway format). gemini-client.ts still
// strips a leading "google/" defensively, so bare names pass through unchanged.
export const IMAGE_MODEL_FAST = "gemini-2.0-flash-exp-image-generation";
export const IMAGE_MODEL_HQ = "gemini-2.0-flash-exp-image-generation";
export const IMAGE_MODEL_CHEAP = "gemini-2.0-flash-exp-image-generation";
export const CHAT_MODEL_DEFAULT = "gemini-3.6-flash";
export const IMAGE_FALLBACK_CHAIN = [IMAGE_MODEL_FAST, IMAGE_MODEL_HQ, IMAGE_MODEL_CHEAP];
