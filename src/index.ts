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
>> name: Stuffed Tomatoes with Rice
>> servings: 4

Preheat the #oven{} to ~{180°C}.

Cut the tops off of @tomatoes{4 large} and scoop out the insides to create a 'shell'. Keep the insides.

In a #pan{}, sauté @onions{1 chopped} and @garlic{2 cloves minced} in @olive oil{2 tbsp} until translucent.

Add the insides of the tomatoes (chopped) to the pan and cook for ~{5 minutes}.

Add @uncooked rice{1 cup} to the pan, along with @water{2 cups}, @salt{}, and @pepper{}. Allow the mixture to simmer until the rice is cooked, approximately ~{18 minutes}.

In the meantime, place the tomato 'shells' in a #baking dish{} and drizzle with a bit of olive oil, then bake for ~{10 minutes}.

Once the rice is cooked, add chopped @fresh basil{2 tbsp} and @grated Parmesan cheese{1/4 cup} to the pan and stir to combine.

Fill the pre-baked tomato shells with the rice mixture.

Return the stuffed tomatoes to the oven and bake for an additional ~{15 minutes}.

Garnish with more fresh basil and serve hot.
`));