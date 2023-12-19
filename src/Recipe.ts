import Parser, { ParserOptions } from './Parser';
import { Ingredient, Cookware, Step, Metadata, ShoppingList } from './cooklang';

export default class Recipe {
    ingredients: Array<Ingredient> = [];
    cookwares: Array<Cookware> = [];
    metadata: Metadata = {};
    steps: Array<Step> = [];
    shoppingList: ShoppingList = {};

    private parser: Parser;

    /**
     * Creates a new recipe from the supplied Cooklang string
     *
     * @param source The Cooklang string to parse. If `source` is ommited, an empty recipe is created
     * @param options The options to pass to the parser
     *
     * @see {@link https://cooklang.org/docs/spec/#the-cook-recipe-specification|Cooklang Recipe}
     */
    constructor(source?: string, options?: ParserOptions) {
        this.parser = new Parser(options);

        if (source)
            Object.assign(this, this.parser.parse(source));
    }

    /**
     * Generates a Cooklang string from the recipes metadata, steps, and shopping lists
     *
     * @returns The generated Cooklang string
     */
    toCooklang(): string {
        let metadataStr = '';
        let stepStrs = [];
        let shoppingListStrs = [];

        for (let [key, value] of Object.entries(this.metadata)) {
            metadataStr += `>> ${key}: ${value}\n`;
        }

        for (let step of this.steps) {
            let stepStr = '';

            for (let item of step) {
                if ('value' in item) {
                    stepStr += item.value;
                } else {
                    if (item.type == 'ingredient') stepStr += '@';
                    else if (item.type == 'cookware') stepStr += '#';
                    else stepStr += '~';

                    stepStr += item.name;

                    stepStr += '{';
                    if (item.quantity) stepStr += item.quantity;
                    if ('units' in item && item.units) stepStr += '%' + item.units;
                    stepStr += '}';
                }
            }

            stepStrs.push(stepStr);
        }

        for (let [category, items] of Object.entries(this.shoppingList)) {
            let shoppingListStr = '';

            shoppingListStr += category + '\n';
            shoppingListStr += items.map(x => x.name + (x.synonym ? '|' + x.synonym : '')).join('\n');

            shoppingListStrs.push(shoppingListStr);
        }

        return [metadataStr, stepStrs.join('\n\n'), shoppingListStrs.join('\n\n')].join('\n');
    }
}
