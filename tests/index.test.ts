import * as fs from 'fs';
import * as yaml from 'yaml';
import { parse_recipe } from '../src/index';


const testsPath = "./tests";
const testFiles = fs.readdirSync(testsPath).filter((f) => f.endsWith(".yaml"));

testFiles.forEach((testFile) => {
    const testYaml = fs.readFileSync(`${testsPath}/${testFile}`, "utf-8");
    const testData = yaml.parse(testYaml).tests as Record<
        string,
        { source: string; result: any }
    >;

    describe(testFile, () => {
        Object.entries(testData).slice(0, 3).forEach(([name, testEntry]) => {
            it(name, () => {
                const { source, result } = testEntry;
                const parsed = parse_recipe(source,1);

                const expected = {
                    steps: result.steps,
                    metadata: Array.isArray(result.metadata) ? {} : result.metadata,
                };

                const actual = {
                    steps: parsed.sections.flatMap((i: any) => i.blocks).flatMap((i: any) => i.step.items).map((i: any) => {
                        console.log(i);
                        switch (i.item_type) {
                        case "text":
                            return {
                                type: "text",
                                value: i.text_value,
                            }
                        case "ingredient_ref":
                                const ingredient = parsed.ingredients[i.ref_index];
                                console.log(ingredient);
                            return {
                                type: "ingredient",
                                quantity: ingredient.amount?.quantity,
                                units: ingredient.amount?.quantity?.units,
                                name: ingredient.name,
                            }
                        case "timer_ref":
                            const timer = parsed.timers[i.ref_index];
                            return {
                                type: "timer",
                                name: timer.name,
                            }
                        case "cookware_ref":
                            const cookware = parsed.cookware[i.ref_index];
                            return {
                                type: "cookware",
                                name: cookware.name,
                            }
                        default:
                            break;
                        }
                    }),
                    metadata: parsed.metadata,
                };

                expect(expected).toStrictEqual(actual);
            });
        });
    });
});
