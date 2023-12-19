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

const p = new Parser({ includeStepNumber: true });

console.log(p.parse(`
>> source: https://www.youtube.com/watch?v=oTyVtAAKPRo
>> tags: [ breakfast ]
>> description: It's scrambled egg, with kimchi, and miso soup
>> servings: 1

Crack @eggs{2} into a #bowl, and beat with chopsticks

Make @Kombu broth (or dashi)

Heat a #small pan{} to high heat with #cooking oil{}

Slowly stir eggs onto pan, cook for about ~{10-15%sec}, then remove and add @sesame oil{} and @kimchi

Stir @miso paste{} into kombu broth, and bring to boil

Pour the soup into the egg-stirring bowl, and top with chopped @scallions
`));
