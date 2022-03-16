import { comment, blockComment, shoppingListToken, tokens } from "./tokens";

/**
 * A parsed ingredient node
 * 
 * @see {@link https://cooklang.org/docs/spec/#ingredients|Cooklang Ingredient Specification}
 */
export interface StepIngredient {
    type: 'ingredient';
    name: string;
    quantity?: string | number;
    units?: string;
}

/**
 * A parsed cookware node
 * 
 * @see {@link https://cooklang.org/docs/spec/#cookware|Cooklang Cookware Specification}
 */
export interface StepCookware {
    type: 'cookware';
    name: string;
    quantity?: string | number;
}

/**
 * A parsed timer node
 * 
 * @see {@link https://cooklang.org/docs/spec/#timer|Cooklang Timer Specification}
 */
export interface StepTimer {
    type: 'timer';
    name?: string;
    quantity?: string | number;
    units?: string;
}

/**
 * A parsed node of text
 */
export interface StepText {
    type: 'text';
    value: string;
}

export interface ShoppingListItem {
    name: string;
    synonym?: string;
}

/**
 * A array of parsed nodes
 */
export type Step = Array<StepIngredient | StepCookware | StepTimer | StepText>;

/**
 * A record of metadata keys and their values
 * 
 * @see {@link https://cooklang.org/docs/spec/#metadata|Cooklang Metadata Specification}
 */
export type Metadata = { [key: string]: string };

/**
 * A record of categories and their items
 * 
 * @see {@link https://cooklang.org/docs/spec/#the-shopping-list-specification|Cooklang Shopping List Specification}
 */
export type ShoppingList = { [key: string]: Array<ShoppingListItem> };

export interface ParseResult {
    metadata: Metadata;
    steps: Array<Step>;
    shoppingList: ShoppingList;
}

export class Parser {
    /**
     * Parses a Cooklang string and returns any metadata, steps, or shopping lists.
     * 
     * @param source A Cooklang string.
     * @returns The extracted metadata, steps, and shopping lists.
     * 
     * @see {@link https://cooklang.org/docs/spec/#the-cook-recipe-specification|Cooklang Recipe Specification}
     */
    parse(source: string): ParseResult {
        const metadata: Metadata = {};
        const steps: Array<Step> = [];
        const shoppingList: ShoppingList = {};

        // Comments
        source = source
            .replace(comment, '')
            .replace(blockComment, ' ');

        // Parse shopping lists
        for (let match of source.matchAll(shoppingListToken)) {
            const groups = match.groups;
            if (!groups) continue;

            shoppingList[groups.name] = parseShoppingListItems(groups.items || '');

            // Remove it from the source
            source = source.substring(0, match.index || 0); + source.substring((match.index || 0) + match[0].length);
        }

        const lines = source
            .split('\n')
            .filter(l => l.trim().length > 0);

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
                    })
                }

                // metadata
                if (groups.key && groups.value) {
                    metadata[groups.key.trim()] = groups.value.trim();
                }

                // single word ingredient
                if (groups.sIngredientName) {
                    step.push({
                        type: 'ingredient',
                        name: groups.sIngredientName,
                        quantity: 'some',
                    })
                }

                // multiword ingredient
                if (groups.mIngredientName) {
                    step.push({
                        type: 'ingredient',
                        name: groups.mIngredientName,
                        quantity: parseQuantity(groups.mIngredientQuantity, 'some'),
                        units: parseUnits(groups.mIngredientUnits),
                    })
                }

                // single word cookware
                if (groups.sCookwareName) {
                    step.push({
                        type: 'cookware',
                        name: groups.sCookwareName,
                    })
                }

                // multiword cookware
                if (groups.mCookwareName) {
                    step.push({
                        type: 'cookware',
                        name: groups.mCookwareName,
                        quantity: parseQuantity(groups.mCookwareQuantity),
                    })
                }

                // timer
                if (groups.timerQuantity) {
                    step.push({
                        type: 'timer',
                        name: groups.timerName,
                        quantity: parseQuantity(groups.timerQuantity),
                        units: parseUnits(groups.timerUnits),
                    })
                }

                pos = (match.index || 0) + match[0].length;
            }

            // If the entire line hasn't been parsed yet
            if (pos < line.length) {
                // Add the rest as a text item
                step.push({
                    type: 'text',
                    value: line.substring(pos),
                })
            }

            if (step.length > 0) steps.push(step);
        }

        return { metadata, steps, shoppingList };
    }
}

function parseQuantity(quantity?: string, defaultText?: string): string | number | undefined {
    if (!quantity || quantity.trim() == '') {
        if (defaultText) return defaultText;
        return undefined;
    }

    quantity = quantity.trim();

    const [left, right] = quantity.split('/');

    const [numLeft, numRight] = [Number(left), Number(right)];

    if (!isNaN(numLeft) && !numRight) return numLeft;
    else if (!isNaN(numLeft) && !isNaN(numRight) && !(left.startsWith('0') || right.startsWith('0'))) return numLeft / numRight;

    return quantity.trim();
}

function parseUnits(units?: string): string | undefined {
    if (!units) return undefined;
    return units.trim();
}

function parseShoppingListItems(items: string): Array<ShoppingListItem> {
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