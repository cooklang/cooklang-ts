use wasm_bindgen::prelude::*;
use serde::Serialize;
use cooklang_bindings;

#[wasm_bindgen]
pub fn parse_recipe(recipe: &str, scaling_factor: u32) -> CooklangRecipe {
    cooklang_bindings::parse_recipe(recipe.to_string(), scaling_factor).into()
}

#[wasm_bindgen]
#[derive(Clone, Serialize)]
pub struct CooklangRecipe {
    #[wasm_bindgen(skip)]
    pub metadata: Vec<(String, String)>,
    #[wasm_bindgen(skip)]
    pub sections: Vec<Section>,
    #[wasm_bindgen(skip)]
    pub ingredients: Vec<Ingredient>,
    #[wasm_bindgen(skip)]
    pub cookware: Vec<Cookware>,
    #[wasm_bindgen(skip)]
    pub timers: Vec<Timer>,
}

// Add getter methods for the fields
#[wasm_bindgen]
impl CooklangRecipe {
    #[wasm_bindgen(getter)]
    pub fn metadata(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.metadata).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn sections(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.sections).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn ingredients(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.ingredients).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn cookware(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.cookware).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn timers(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.timers).unwrap()
    }
}

pub type ComponentRef = u32;

#[wasm_bindgen]
#[derive(Clone, Serialize)]
pub struct Section {
    #[wasm_bindgen(skip)]
    pub title: Option<String>,
    #[wasm_bindgen(skip)]
    pub blocks: Vec<Block>,
    #[wasm_bindgen(skip)]
    pub ingredient_refs: Vec<ComponentRef>,
    #[wasm_bindgen(skip)]
    pub cookware_refs: Vec<ComponentRef>,
    #[wasm_bindgen(skip)]
    pub timer_refs: Vec<ComponentRef>,
}

// Add getters for Section
#[wasm_bindgen]
impl Section {
    #[wasm_bindgen(getter)]
    pub fn title(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.title).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn blocks(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.blocks).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn ingredient_refs(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.ingredient_refs).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn cookware_refs(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.cookware_refs).unwrap()
    }

    #[wasm_bindgen(getter)]
    pub fn timer_refs(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.timer_refs).unwrap()
    }
}

#[derive(Clone, Serialize)]
pub struct Block {
    pub block_type: String,
    pub step: Option<Step>,
    pub note: Option<BlockNote>,
}

#[derive(Clone, Serialize)]
pub struct Step {
    pub items: Vec<Item>,
    pub ingredient_refs: Vec<ComponentRef>,
    pub cookware_refs: Vec<ComponentRef>,
    pub timer_refs: Vec<ComponentRef>,
}

#[derive(Clone, Serialize)]
pub struct BlockNote {
    pub text: String,
}

#[derive(Clone, Serialize)]
pub struct Ingredient {
    pub name: String,
    pub amount: Option<Amount>,
    pub descriptor: Option<String>,
}

#[derive(Clone, Serialize)]
pub struct Cookware {
    pub name: String,
    pub amount: Option<Amount>,
}

#[derive(Clone, Serialize)]
pub struct Timer {
    pub name: Option<String>,
    pub amount: Option<Amount>,
}

#[derive(Clone, Serialize)]
pub struct Item {
    pub item_type: String,
    pub text_value: Option<String>,
    pub ref_index: Option<usize>,
}

#[derive(Clone, Serialize)]
pub struct Amount {
    pub quantity: Value,
    pub units: Option<String>,
}

#[derive(Clone, Serialize)]
pub struct Value {
    pub value_type: String,
    pub number_value: Option<f64>,
    pub range_start: Option<f64>,
    pub range_end: Option<f64>,
    pub text_value: Option<String>,
}

// Helper methods for constructing these types
impl Block {
    pub fn step(step: Step) -> Self {
        Block {
            block_type: "step".to_string(),
            step: Some(step),
            note: None,
        }
    }

    pub fn note(note: BlockNote) -> Self {
        Block {
            block_type: "note".to_string(),
            step: None,
            note: Some(note),
        }
    }
}

impl Item {
    pub fn text(value: String) -> Self {
        Item {
            item_type: "text".to_string(),
            text_value: Some(value),
            ref_index: None,
        }
    }

    pub fn ingredient_ref(index: usize) -> Self {
        Item {
            item_type: "ingredient_ref".to_string(),
            text_value: None,
            ref_index: Some(index),
        }
    }

    pub fn cookware_ref(index: usize) -> Self {
        Item {
            item_type: "cookware_ref".to_string(),
            text_value: None,
            ref_index: Some(index),
        }
    }

    pub fn timer_ref(index: usize) -> Self {
        Item {
            item_type: "timer_ref".to_string(),
            text_value: None,
            ref_index: Some(index),
        }
    }
}

impl Value {
    pub fn number(value: f64) -> Self {
        Value {
            value_type: "number".to_string(),
            number_value: Some(value),
            range_start: None,
            range_end: None,
            text_value: None,
        }
    }

    pub fn range(start: f64, end: f64) -> Self {
        Value {
            value_type: "range".to_string(),
            number_value: None,
            range_start: Some(start),
            range_end: Some(end),
            text_value: None,
        }
    }

    pub fn text(value: String) -> Self {
        Value {
            value_type: "text".to_string(),
            number_value: None,
            range_start: None,
            range_end: None,
            text_value: Some(value),
        }
    }

    pub fn empty() -> Self {
        Value {
            value_type: "empty".to_string(),
            number_value: None,
            range_start: None,
            range_end: None,
            text_value: None,
        }
    }
}


impl From<cooklang_bindings::model::CooklangRecipe> for CooklangRecipe {
    fn from(recipe: cooklang_bindings::model::CooklangRecipe) -> Self {
        CooklangRecipe {
            metadata: recipe.metadata.into_iter().collect(),
            sections: recipe.sections.into_iter().map(|s| s.into()).collect(),
            ingredients: recipe.ingredients.into_iter().map(|i| i.into()).collect(),
            cookware: recipe.cookware.into_iter().map(|c| c.into()).collect(),
            timers: recipe.timers.into_iter().map(|t| t.into()).collect(),
        }
    }
}

impl From<cooklang_bindings::model::Section> for Section {
    fn from(section: cooklang_bindings::model::Section) -> Self {
        Section {
            title: section.title,
            blocks: section.blocks.into_iter().map(|b| b.into()).collect(),
            ingredient_refs: section.ingredient_refs,
            cookware_refs: section.cookware_refs,
            timer_refs: section.timer_refs,
        }
    }
}

impl From<cooklang_bindings::model::Block> for Block {
    fn from(block: cooklang_bindings::model::Block) -> Self {
        match block {
            cooklang_bindings::model::Block::StepBlock(step) => Block::step(step.into()),
            cooklang_bindings::model::Block::NoteBlock(text) => Block::note(text.into()),
        }
    }
}

impl From<cooklang_bindings::model::Step> for Step {
    fn from(step: cooklang_bindings::model::Step) -> Self {
        Step {
            items: step.items.into_iter().map(|i| i.into()).collect(),
            ingredient_refs: step.ingredient_refs,
            cookware_refs: step.cookware_refs,
            timer_refs: step.timer_refs,
        }
    }
}

impl From<cooklang_bindings::model::BlockNote> for BlockNote {
    fn from(note: cooklang_bindings::model::BlockNote) -> Self {
        BlockNote {
            text: note.text,
        }
    }
}

impl From<cooklang_bindings::model::Ingredient> for Ingredient {
    fn from(ingredient: cooklang_bindings::model::Ingredient) -> Self {
        Ingredient {
            name: ingredient.name,
            amount: ingredient.amount.map(|a| a.into()),
            descriptor: ingredient.descriptor,
        }
    }
}

impl From<cooklang_bindings::model::Cookware> for Cookware {
    fn from(cookware: cooklang_bindings::model::Cookware) -> Self {
        Cookware {
            name: cookware.name,
            amount: cookware.amount.map(|a| a.into()),
        }
    }
}

impl From<cooklang_bindings::model::Timer> for Timer {
    fn from(timer: cooklang_bindings::model::Timer) -> Self {
        Timer {
            name: timer.name,
            amount: timer.amount.map(|a| a.into()),
        }
    }
}

impl From<cooklang_bindings::model::Item> for Item {
    fn from(item: cooklang_bindings::model::Item) -> Self {
        match item {
            cooklang_bindings::model::Item::Text { value } => Item::text(value),
            cooklang_bindings::model::Item::IngredientRef { index } => {
                Item::ingredient_ref(index.try_into().unwrap())
            },
            cooklang_bindings::model::Item::CookwareRef { index } => {
                Item::cookware_ref(index.try_into().unwrap())
            },
            cooklang_bindings::model::Item::TimerRef { index } => {
                Item::timer_ref(index.try_into().unwrap())
            },
        }
    }
}

impl From<cooklang_bindings::model::Amount> for Amount {
    fn from(amount: cooklang_bindings::model::Amount) -> Self {
        unsafe {
            let quantity = std::ptr::read(&amount as *const _ as *const cooklang_bindings::model::Value);
            let units = std::ptr::read(&amount as *const _ as *const Option<String>);
            Amount {
                quantity: quantity.into(),
                units,
            }
        }
    }
}

impl From<cooklang_bindings::model::Value> for Value {
    fn from(value: cooklang_bindings::model::Value) -> Self {
        match value {
            cooklang_bindings::model::Value::Number { value } => Value::number(value),
            cooklang_bindings::model::Value::Range { start, end } => Value {
                value_type: "range".to_string(),
                number_value: None,
                range_start: Some(start),
                range_end: Some(end),
                text_value: None,
            },
            cooklang_bindings::model::Value::Text { value } => Value {
                value_type: "text".to_string(),
                number_value: None,
                range_start: None,
                range_end: None,
                text_value: Some(value),
            },
            cooklang_bindings::model::Value::Empty => Value {
                value_type: "empty".to_string(),
                number_value: None,
                range_start: None,
                range_end: None,
                text_value: None,
            },
        }
    }
}
