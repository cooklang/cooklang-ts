const metadata = /^>>\s*(?<key>.+?):\s*(?<value>.+)/;

const multiwordIngredient = /@(?<mIngredientName>[^@#~[]+?){(?<mIngredientQuantity>[^]*?)(?:%(?<mIngredientUnits>[^}]+?))?}/;
const singleWordIngredient = /@(?<sIngredientName>[^\s]+)/;

const multiwordCookware = /#(?<mCookwareName>[^@#~[]+?){(?<mCookwareQuantity>.*?)}/;
const singleWordCookware = /#(?<sCookwareName>[^\s]+)/;

const timer = /~(?<timerName>.*?)(?:{(?<timerQuantity>.*?)(?:%(?<timerUnits>.+))?})/;

export const comment = /--.*/g;
export const blockComment = /\s*\[\-.*?\-\]\s*/g;

export const shoppingListToken = /\[(?<name>.+)\](?<items>[^]*?)(?:\n\n|$)/g;
export const tokens = new RegExp([metadata, multiwordIngredient, singleWordIngredient, multiwordCookware, singleWordCookware, timer].map(r => r.source).join('|'), 'g');
