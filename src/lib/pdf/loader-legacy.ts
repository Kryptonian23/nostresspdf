/**
 * PDF.js Legacy Library Loader
 * 
 * Compatibility boundary for two temporarily disabled SVG tools.
 *
 * The former implementation loaded PDF.js 2.x for SVGGraphics. That release
 * has a known arbitrary-JavaScript vulnerability, so it must not be shipped.
 * Keep these exports until the tools are migrated to a supported renderer.
 */

interface PDFJSLegacyModule {
    getDocument(options: Record<string, unknown>): {
        promise: Promise<any>;
    };
}

const REMOVAL_MESSAGE =
    'Legacy PDF-to-SVG rendering is disabled until it is migrated to a supported renderer.';

/**
 * Load legacy pdfjs-dist library (v2.16.105)
 * Used specifically for PDF to SVG vector conversion with SVGGraphics
 */
export async function loadPdfjsLegacy(): Promise<PDFJSLegacyModule> {
    throw new Error(REMOVAL_MESSAGE);
}

/**
 * SVGGraphics type definition
 */
export interface SVGGraphicsInstance {
    embedFonts: boolean;
    getSVG(operatorList: any, viewport: any): Promise<SVGElement>;
}

export interface SVGGraphicsConstructor {
    new(commonObjs: any, objs: any): SVGGraphicsInstance;
}

/**
 * Load SVGGraphics class from legacy pdfjs-dist
 * This is the main reason for using the legacy version
 */
export async function loadSVGGraphics(): Promise<SVGGraphicsConstructor> {
    throw new Error(REMOVAL_MESSAGE);
}

/**
 * Check if legacy library is loaded
 */
export function isLegacyLibraryLoaded(): boolean {
    return false;
}

/**
 * Get legacy library loading status
 */
export function getLegacyLibraryStatus(): 'loaded' | 'loading' | 'not-loaded' {
    return 'not-loaded';
}
