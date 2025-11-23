// Show deprecation warning once per process
let warningShown = false;
function showDeprecationWarning() {
    if (!warningShown && typeof process !== 'undefined' && !process.env.COOKLANG_SUPPRESS_DEPRECATION_WARNING) {
        warningShown = true;
        console.warn('\n⚠️  DEPRECATION WARNING ⚠️');
        console.warn('The @cooklang/cooklang-ts package is deprecated and no longer maintained.');
        console.warn('Please migrate to @cooklang/cooklang for better performance and active support.');
        console.warn('Migration guide: https://github.com/cooklang/cooklang-rs/blob/main/typescript/MIGRATION.md');
        console.warn('To suppress this warning: set COOKLANG_SUPPRESS_DEPRECATION_WARNING=1\n');
    }
}

// Show warning when module is imported
showDeprecationWarning();

export interface ImageURLOptions {
    step?: number;
    extension?: 'png' | 'jpg';
}

/**
 * Creates a URL for an image of the the supplied recipe.
 *
 * @example
 * ```typescript
 * getImageURL('Baked Potato', { extension: 'jpg', step: 2 });
 * // returns "Baked Potato.2.jpg"
 * ```
 *
 * @param name Name of the .cook file.
 * @param options The URL options.
 * @returns The image URL for the givin recipe and step.
 *
 * @see {@link https://cooklang.org/docs/spec/#adding-pictures|Cooklang Pictures Specification}
 */
export function getImageURL(name: string, options?: ImageURLOptions) {
    options ??= {};
    return name + (options.step ? '.' + options.step : '') + '.' + (options.extension || 'png');
}

import Recipe from './Recipe';
import Parser from './Parser';

export { Recipe, Parser };

export * from './Recipe';
export * from './Parser';
export * from './cooklang';
