import { Recipe, Parser, getImageURL } from "@cooklang/cooklang-ts";

const source = `
>> source: https://www.dinneratthezoo.com/wprm_print/6796
>> total time: 6 minutes
>> servings: 2

Place the @apple juice{1,5%cups}, @banana{one sliced}, @frozen mixed berries{1,5%cups} and @vanilla greek yogurt{3/4%cup} in a #blender{}; blend until smooth. If the smoothie seems too thick, add a little more liquid (1/4 cup). 

Taste and add @honey{} if desired. Pour into two glasses and garnish with fresh berries and mint sprigs if desired.
`;

console.log(new Recipe(source));
// {
//     metadata: {...},
//     steps: [
//         [...],
//         [...]
//     ],
//     shoppingList: {}
// }

console.log(new Parser().parse(source).metadata);
// {
//     source: 'https://www.dinneratthezoo.com/wprm_print/6796',
//     'total time': '6 minutes',
//     servings: '2',
// }

console.log(getImageURL('Mixed Berry Smoothie', {
    step: 1,
    extension: 'png'
}));
// 'Mixed Berry Smoothie.1.png'
