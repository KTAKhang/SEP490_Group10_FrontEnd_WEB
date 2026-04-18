/** Max length aligned with backend validation for map embed URL */
export const MAX_MAP_EMBED_URL_LENGTH = 8000;

/** Sandboxed embed for third-party map iframes (e.g. Google Maps). */
export const SHOP_MAP_IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox";

/**
 * Normalize shop API payload so UI always reads `mapEmbedUrl` (camelCase).
 * Legacy DB / snake_case responses may use `map_embed_url` or omit the field.
 */
export function normalizeShopPayload(data) {
  if (!data || typeof data !== "object") return data;
  const raw = data.mapEmbedUrl ?? data.map_embed_url;
  const mapEmbedUrl =
    raw == null || raw === "" ? "" : String(raw).trim();
  return { ...data, mapEmbedUrl };
}

/** Resolved embed URL for display (empty string if none). */
export function getMapEmbedUrl(shop) {
  if (!shop || typeof shop !== "object") return "";
  const raw = shop.mapEmbedUrl ?? shop.map_embed_url;
  if (raw == null || raw === "") return "";
  return String(raw).trim();
}

/**
 * Client-side validation mirroring BE rules (http/https, max length).
 * @returns {string|null} Vietnamese error message, or null if valid / empty
 */
export function validateMapEmbedUrlInput(value) {
  const v = value == null ? "" : String(value).trim();
  if (v.length === 0) return null;
  if (v.length > MAX_MAP_EMBED_URL_LENGTH) {
    return `URL embed tối đa ${MAX_MAP_EMBED_URL_LENGTH} ký tự.`;
  }
  if (!/^https?:\/\//i.test(v)) {
    return "URL phải bắt đầu bằng http:// hoặc https://";
  }
  return null;
}
