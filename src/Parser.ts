import { comment, blockComment, shoppingList as shoppingListRegex, tokens } from './tokens';
import { Ingredient, Cookware, Step, Metadata, Item, ShoppingList } from './cooklang';

/**
 * @property defaultCookwareAmount The default value to pass if there is no cookware amount. By default the amount is 1
 * @property defaultIngredientAmount The default value to pass if there is no ingredient amount. By default the amount is "some"
 */
export interface ParserOptions {
    defaultCookwareAmount?: string | number;
    defaultIngredientAmount?: string | number;
}

export interface ParseResult {
    ingredients: Array<Ingredient>;
    cookwares: Array<Cookware>;
    metadata: Metadata;
    steps: Array<Step>;
    shoppingList: ShoppingList;
}

export default class Parser {
    defaultCookwareAmount: string | number;
    defaultIngredientAmount: string | number;
    defaultUnits = '';

    /**
     * Creates a new parser with the supplied options
     * 
     * @param options The parser's options
     */
    constructor(options?: ParserOptions) {
        this.defaultCookwareAmount = options?.defaultCookwareAmount ?? 1;
        this.defaultIngredientAmount = options?.defaultIngredientAmount ?? 'some';
    }

    /**
     * Parses a Cooklang string and returns any metadata, steps, or shopping lists
     * 
     * @param source A Cooklang recipe
     * @returns The extracted ingredients, cookwares, metadata, steps, and shopping lists
     * 
     * @see {@link https://cooklang.org/docs/spec/#the-cook-recipe-specification|Cooklang Recipe}
     */
    parse(source: string): ParseResult {
        const ingredients: Array<Ingredient> = [];
        const cookwares: Array<Cookware> = [];
        const metadata: Metadata = {};
        const steps: Array<Step> = [];
        const shoppingList: ShoppingList = {};

        // Comments
        source = source.replace(comment, '').replace(blockComment, ' ');

        // Parse shopping lists
        for (let match of source.matchAll(shoppingListRegex)) {
            const groups = match.groups;
            if (!groups) continue;

            shoppingList[groups.name] = parseShoppingListCategory(
                groups.items || ''
            );

            // Remove it from the source
            source = source.substring(0, match.index || 0);
            +source.substring((match.index || 0) + match[0].length);
        }

        const lines = source.split(/\r?\n/).filter((l) => l.trim().length > 0);

        for (let line of lines) {
            const step: Step = [];

            let pos = 0;
            for (let match of line.matchAll(tokens)) {
                const groups = match.groups;
                if (!groups) continue;

                // text
                if (pos < (match.index || 0)) {
                    step.push({
                        type: 'text',
                        value: line.substring(pos, match.index),
                    });
                }

                // metadata
                if (groups.key && groups.value) {
                    metadata[groups.key.trim()] = groups.value.trim();
                }

                // single word ingredient
                if (groups.sIngredientName) {
                    const ingredient: Ingredient = {
                        type: 'ingredient',
                        name: groups.sIngredientName,
                        quantity: this.defaultIngredientAmount,
                        units: this.defaultUnits,
                    };

                    ingredients.push(ingredient);
                    step.push(ingredient);
                }

                // multiword ingredient
                if (groups.mIngredientName) {
                    const ingredient: Ingredient = {
                        type: 'ingredient',
                        name: groups.mIngredientName,
                        quantity:
                            parseQuantity(groups.mIngredientQuantity) ??
                            this.defaultIngredientAmount,
                        units: parseUnits(groups.mIngredientUnits) ?? this.defaultUnits,
                    };

                    ingredients.push(ingredient);
                    step.push(ingredient);
                }

                // single word cookware
                if (groups.sCookwareName) {
                    const cookware: Cookware = {
                        type: 'cookware',
                        name: groups.sCookwareName,
                        quantity: this.defaultCookwareAmount,
                    };

                    cookwares.push(cookware);
                    step.push(cookware);
                }

                // multiword cookware
                if (groups.mCookwareName) {
                    const cookware: Cookware = {
                        type: 'cookware',
                        name: groups.mCookwareName,
                        quantity:
                            parseQuantity(groups.mCookwareQuantity) ??
                            this.defaultCookwareAmount,
                    };

                    cookwares.push(cookware);
                    step.push(cookware);
                }

                // timer
                if (groups.timerQuantity) {
                    step.push({
                        type: 'timer',
                        name: groups.timerName,
                        quantity: parseQuantity(groups.timerQuantity) ?? 0,
                        units: parseUnits(groups.timerUnits) ?? this.defaultUnits,
                    });
                }

                pos = (match.index || 0) + match[0].length;
            }

            // If the entire line hasn't been parsed yet
            if (pos < line.length) {
                // Add the rest as a text item
                step.push({
                    type: 'text',
                    value: line.substring(pos),
                });
            }

            if (step.length > 0) steps.push(step);
        }

        return { ingredients, cookwares, metadata, steps, shoppingList };
    }
}

function parseQuantity(quantity?: string): string | number | undefined {
    if (!quantity || quantity.trim() === '') {
        return undefined;
    }

    quantity = quantity.trim();

    const [left, right] = quantity.split('/');

    const [numLeft, numRight] = [Number(left), Number(right)];

    if(right && isNaN(numRight)) return quantity;

    if (!isNaN(numLeft) && !numRight) return numLeft;
    else if (!isNaN(numLeft) && !isNaN(numRight) && !(left.startsWith('0') || right.startsWith('0'))) return numLeft / numRight;

    return quantity.trim();
}

function parseUnits(units?: string): string | undefined {
    if (!units || units.trim() === "") {
        return undefined;
    }

    return units.trim();
}

function parseShoppingListCategory(items: string): Array<Item> {
    const list = [];

    for (let item of items.split('\n')) {
        item = item.trim();

        if (item == '') continue;

        const [name, synonym] = item.split('|');

        list.push({
            name: name.trim(),
            synonym: synonym?.trim() || '',
        })
    }

    return list;
}