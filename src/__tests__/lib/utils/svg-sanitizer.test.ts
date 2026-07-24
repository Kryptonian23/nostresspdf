import { describe, expect, it } from 'vitest';
import { sanitizeSvgForPreview } from '@/lib/utils/svg-sanitizer';

describe('sanitizeSvgForPreview', () => {
  it('removes active content and remote references from SVG previews', () => {
    const unsafe = `
      <svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)">
        <script>alert(1)</script>
        <foreignObject><iframe src="https://example.com"></iframe></foreignObject>
        <image href="https://tracker.example/pixel.png" />
        <image href="data:image/png;base64,AAAA" />
        <rect style="fill:url(https://tracker.example/a)" width="10" height="10" />
      </svg>
    `;

    const clean = sanitizeSvgForPreview(unsafe);

    expect(clean).not.toMatch(/script|foreignObject|iframe|onload|tracker\.example|style=/i);
    expect(clean).toContain('data:image/png;base64,AAAA');
  });
});
