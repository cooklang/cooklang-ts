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
