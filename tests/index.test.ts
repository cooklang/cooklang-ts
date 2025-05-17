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
        Object.entries(testData).forEach(([name, testEntry]) => {
            it(name, () => {
                const { source, result } = testEntry;
                const parsed = parse_recipe(source);

                const expected = {
                    steps: result.steps,
                    metadata: Array.isArray(result.metadata) ? {} : result.metadata,
                };

                const actual = {
                    steps: parsed.steps,
                    metadata: parsed.metadata,
                };

                const state = new State();
                const { value, error } = state.parse_full(source, false);


                expect(value).toStrictEqual(result);
            });
        });
    });
});
