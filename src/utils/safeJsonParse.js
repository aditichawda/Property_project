/**
 * Parse JSON without throwing (corrupt localStorage, manual edits, etc.).
 * @param {string|null|undefined} str
 * @param {T|null} fallback
 * @returns {T|null}
 * @template T
 */
export function safeJsonParse(str, fallback = null) {
  if (str == null || str === '') return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}
