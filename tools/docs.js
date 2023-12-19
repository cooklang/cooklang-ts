// Generates the homepage readme and the documentation readme from the example, along with the actual documentation
const fs = require('node:fs/promises');

let gh = writer();
let docs = writer();

(async () => {
    // Grab the example file
    const template = await fs.readFile('tools/readme-template.txt', 'utf-8');
    const example = await fs.readFile('src/example.ts', 'utf-8');

    for (let line of template.split('\n')) {
        if (line.startsWith('g ')) {
            gh.writeln(line.substring(2));
        } else if (line.startsWith('d ')) {
            docs.writeln(line.substring(2));
        } else {
            if (line.includes('%EXAMPLE%')) line = example;
            gh.writeln(line);
            docs.writeln(line);
        }
    }

    await fs.writeFile('./.github/README.md', gh.out());
    console.log('Wrote readme.md');

    await fs.writeFile('./README.md', docs.out());
    console.log('Wrote docs_readme.md');
})();

function writer() {
    return {
        output: '',
        writeln(line) {
            this.output += line + '\n';
        },
        out() {
            return this.output;
        },
    }
}
