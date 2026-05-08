const LS_KEYS = {
  groqApiKey: "jarvis_groq_api_key",
  groqModel: "jarvis_groq_model",
  elevenLabsApiKey: "jarvis_elevenlabs_api_key",
  elevenLabsVoiceId: "jarvis_elevenlabs_voice_id",
  elevenLabsModelId: "jarvis_elevenlabs_model_id",
  groqProxyUrl: "jarvis_groq_proxy_url",
  elevenLabsProxyUrl: "jarvis_elevenlabs_proxy_url",
};

/**
 * @returns {{
 *   groqApiKey?: string,
 *   groqModel?: string,
 *   elevenLabsApiKey?: string,
 *   elevenLabsVoiceId?: string,
 *   elevenLabsModelId?: string,
 *   groqProxyUrl?: string,
 *   elevenLabsProxyUrl?: string
 * }}
 */
export function loadSecretsFromLocalStorage() {
  const raw = {
    groqApiKey: localStorage.getItem(LS_KEYS.groqApiKey) ?? "",
    groqModel: localStorage.getItem(LS_KEYS.groqModel) ?? "",
    elevenLabsApiKey:
      localStorage.getItem(LS_KEYS.elevenLabsApiKey) ?? "",
    elevenLabsVoiceId:
      localStorage.getItem(LS_KEYS.elevenLabsVoiceId) ?? "",
    elevenLabsModelId:
      localStorage.getItem(LS_KEYS.elevenLabsModelId) ?? "",
    groqProxyUrl: localStorage.getItem(LS_KEYS.groqProxyUrl) ?? "",
    elevenLabsProxyUrl:
      localStorage.getItem(LS_KEYS.elevenLabsProxyUrl) ?? "",
  };

  return raw;
}

/**
 * Saves non-empty values only.
 * @param {{
 *   groqApiKey?: string,
 *   groqModel?: string,
 *   elevenLabsApiKey?: string,
 *   elevenLabsVoiceId?: string,
 *   elevenLabsModelId?: string,
 *   groqProxyUrl?: string,
 *   elevenLabsProxyUrl?: string
 * }} secrets
 */
export function saveSecretsToLocalStorage(secrets) {
  /** @type {Record<string,string>} */
  const clean = {};

  Object.entries(LS_KEYS).forEach(([k, lsKey]) => {
    const v = /** @type {unknown} */ (secrets[k]);
    if (typeof v !== "string") return;
    const trimmed = v.trim();
    if (!trimmed) return;
    clean[k] = trimmed;
  });

  Object.entries(clean).forEach(([k, v]) => {
    localStorage.setItem(LS_KEYS[k], v);
  });
}

function promptMaybe(label, current) {
  const input = window.prompt(label, current ?? "");
  if (input === null) return null;
  return `${input}`.trim();
}

/**
 * Prompts the user for keys/voice if missing (or when force=true).
 * Values are stored locally so they won't be committed to GitHub.
 *
 * @param {{ force?: boolean }} opts
 */
export async function ensureSecretsPrompt({ force } = {}) {
  const existing = loadSecretsFromLocalStorage();

  const wantGroq = force || !existing.groqApiKey;
  const wantEleven =
    force || !existing.elevenLabsApiKey || !existing.elevenLabsVoiceId;

  /** @type {Record<string,string>} */
  const updates = {};

  if (wantGroq) {
    const groqApiKey = promptMaybe(
      "Paste your Groq API key (starts with gsk_…):",
      existing.groqApiKey
    );
    if (groqApiKey) updates.groqApiKey = groqApiKey;

    const groqModel = promptMaybe(
      "Groq model (leave blank to use default):",
      existing.groqModel
    );
    if (groqModel) updates.groqModel = groqModel;
  }

  if (wantEleven) {
    const elevenLabsApiKey = promptMaybe(
      "Paste your ElevenLabs API key (xi-api-key):",
      existing.elevenLabsApiKey
    );
    if (elevenLabsApiKey)
      updates.elevenLabsApiKey = elevenLabsApiKey;

    const elevenLabsVoiceId = promptMaybe(
      "ElevenLabs VOICE_ID (the voice you want):",
      existing.elevenLabsVoiceId
    );
    if (elevenLabsVoiceId)
      updates.elevenLabsVoiceId = elevenLabsVoiceId;

    const elevenLabsModelId = promptMaybe(
      "ElevenLabs TTS model id (optional, e.g. eleven_flash_v2_5):",
      existing.elevenLabsModelId
    );
    if (elevenLabsModelId) updates.elevenLabsModelId = elevenLabsModelId;
  }

  saveSecretsToLocalStorage(updates);
  return loadSecretsFromLocalStorage();
}

