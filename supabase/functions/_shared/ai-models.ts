// The ONLY place model IDs live. Update here, all functions follow.
export const IMAGE_MODEL_FAST = "google/gemini-3.1-flash-image";
export const IMAGE_MODEL_HQ = "google/gemini-3-pro-image";
export const IMAGE_MODEL_CHEAP = "google/gemini-2.5-flash-image";
export const CHAT_MODEL_DEFAULT = "google/gemini-2.5-flash";
export const IMAGE_FALLBACK_CHAIN = [IMAGE_MODEL_FAST, IMAGE_MODEL_HQ, IMAGE_MODEL_CHEAP];
