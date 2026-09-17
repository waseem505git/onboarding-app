/**
 * Sanitization helpers. Workbook content is untrusted input: it may contain
 * formulas, HTML fragments, or unsafe URLs. We never execute or render it as
 * markup — everything is treated and rendered as plain text, and links are
 * validated before use.
 */

/** Strips characters that could be misused if content were ever interpreted as markup,
 * and collapses control characters. This does NOT get rendered as HTML anywhere;
 * React text nodes already escape output, but we still normalize defensively. */
export function sanitizeText(value: unknown): string {
  if (value === null || value === undefined) return '';
  let text = typeof value === 'string' ? value : String(value);
  // eslint-disable-next-line no-control-regex
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  // Neutralize a leading formula/HTML-injection character some spreadsheet tools warn about.
  if (/^[=+\-@]/.test(text.trim())) {
    text = `'${text}`;
  }
  return text.trim();
}

const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:'];

/** Returns a safe URL string, or undefined if the URL is missing/unsafe (e.g. javascript:). */
export function sanitizeUrl(value: unknown): string | undefined {
  if (!value) return undefined;
  const raw = sanitizeText(value);
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (!SAFE_PROTOCOLS.includes(url.protocol)) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}
