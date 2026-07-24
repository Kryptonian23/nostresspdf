import DOMPurify from 'dompurify';

/**
 * Sanitize SVG generated from an untrusted document before inserting it into
 * the application DOM. Downloaded output is left unchanged; this protects the
 * HushPDF preview itself from scripts, event handlers, embedded HTML, and
 * CSS-based network loads.
 */
export function sanitizeSvgForPreview(svg: string): string {
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: [
      'script',
      'style',
      'foreignObject',
      'iframe',
      'object',
      'embed',
      'audio',
      'video',
    ],
    FORBID_ATTR: ['style'],
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: true,
    ALLOWED_URI_REGEXP: /^(?:(?:data:image\/(?:png|gif|jpeg|webp);base64,)|(?:blob:)|(?:#)|(?:\/))/i,
  });
}
