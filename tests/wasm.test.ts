import * as fs from 'fs';
import * as yaml from 'yaml';
import { parse_recipe } from '../src/index';


describe("wasm", () => {
    it("should parse a recipe", () => {
        const source = "Mix @eggs{3} and @milk{1%cup} and @flour{1/2%cup}";
        const parsed = parse_recipe(source);

        const expected = `{
  "metadata": {
    "map": {}
  },
  "sections": [
    {
      "content": [
        {
          "type": "step",
          "value": {
            "items": [
              {
                "type": "text",
                "value": "Mix "
              },
              {
                "type": "ingredient",
                "index": 0
              },
              {
                "type": "text",
                "value": " and "
              },
              {
                "type": "ingredient",
                "index": 1
              },
              {
                "type": "text",
                "value": " and "
              },
              {
                "type": "ingredient",
                "index": 2
              }
            ],
            "number": 1
          }
        }
      ]
    }
  ],
  "ingredients": [
    {
      "name": "eggs",
      "quantity": {
        "value": {
          "type": "fixed",
          "value": {
            "type": "number",
            "value": {
              "type": "regular",
              "value": 3
            }
          }
        }
      },
      "relation": {},
      "modifiers": ""
    },
    {
      "name": "milk",
      "quantity": {
        "value": {
          "type": "fixed",
          "value": {
            "type": "number",
            "value": {
              "type": "regular",
              "value": 1
            }
          }
        },
        "unit": "cup"
      },
      "relation": {},
      "modifiers": ""
    },
    {
      "name": "flour",
      "quantity": {
        "value": {
          "type": "fixed",
          "value": {
            "type": "number",
            "value": {
              "type": "fraction",
              "value": {
                "whole": 0,
                "num": 1,
                "den": 2,
                "err": 0
              }
            }
          }
        },
        "unit": "cup"
      },
      "relation": {},
      "modifiers": ""
    }
  ],
  "cookware": [],
  "timers": [],
  "inline_quantities": []
}`;

        const actual = JSON.stringify(parsed, null, 2);

        expect(actual).toStrictEqual(expected);
    });
});

