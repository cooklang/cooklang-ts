use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use cooklang::model::Item as OriginalItem;
use cooklang::quantity::{
    Quantity as OriginalQuantity, ScalableValue as OriginalScalableValue, Value as OriginalValue,
};
use cooklang::ScalableRecipe as OriginalRecipe;

#[derive(Serialize, Deserialize)]
pub struct ItemText {
    pub value: String,
}

#[derive(Serialize, Deserialize)]
pub struct ItemIngredient {
    pub name: String,
    pub amount: Option<Amount>,
}

#[derive(Serialize, Deserialize)]
pub struct ItemCookware {
    pub name: String,
    pub amount: Option<Amount>,
}

#[derive(Serialize, Deserialize)]
pub struct ItemTimer {
    pub name: Option<String>,
    pub amount: Option<Amount>,
}

#[derive(Serialize, Deserialize)]
pub enum ItemType {
    Text,
    Ingredient,
    Cookware,
    Timer,
}

#[derive(Serialize, Deserialize)]
pub struct Item {
    pub item_type: ItemType,
    pub text: Option<ItemText>,
    pub ingredient: Option<ItemIngredient>,
    pub cookware: Option<ItemCookware>,
    pub timer: Option<ItemTimer>,
}

#[derive(Serialize, Deserialize)]
pub struct CooklangRecipe {
    pub metadata: CooklangMetadata,
    pub steps: Vec<Step>,
    pub ingredients: IngredientList,
    pub cookware: Vec<Item>,
}

#[derive(Serialize, Deserialize)]
pub struct Step {
    pub items: Vec<Item>,
}

#[derive(Serialize, Deserialize)]
pub struct IngredientList {
    inner: HashMap<String, GroupedQuantity>
}

#[derive(Serialize, Deserialize)]
impl IngredientList {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            inner: HashMap::new()
        }
    }

    pub fn insert(&mut self, key: String, value: GroupedQuantity) {
        self.inner.insert(key, value);
    }

    pub fn get(&self, key: &str) -> Option<GroupedQuantity> {
        self.inner.get(key).cloned()
    }
}

pub(crate) fn into_group_quantity(amount: &Option<Amount>) -> GroupedQuantity {
    // options here:
    // - same units:
    //    - same value type
    //    - not the same value type
    // - different units
    // - no units
    // - no amount
    //
    // \
    //  |- <litre,Number> => 1.2
    //  |- <litre,Text> => half
    //  |- <,Text> => pinch
    //  |- <,Empty> => Some
    //
    //
    // TODO define rules on language spec level???
    let empty_units = "".to_string();

    let key = if let Some(amount) = amount {
        let units = amount.units.as_ref().unwrap_or(&empty_units);

        match &amount.quantity {
            Value::Number { .. } => GroupedQuantityKey {
                name: units.to_string(),
                unit_type: QuantityType::Number,
            },
            Value::Range { .. } => GroupedQuantityKey {
                name: units.to_string(),
                unit_type: QuantityType::Range,
            },
            Value::Text { .. } => GroupedQuantityKey {
                name: units.to_string(),
                unit_type: QuantityType::Text,
            },
            Value::Empty => GroupedQuantityKey {
                name: units.to_string(),
                unit_type: QuantityType::Empty,
            },
        }
    } else {
        GroupedQuantityKey {
            name: empty_units,
            unit_type: QuantityType::Empty,
        }
    };

    let value = if let Some(amount) = amount {
        amount.quantity.clone()
    } else {
        Value::Empty
    };

    GroupedQuantity::from([(key, value)])
}

#[derive(Serialize, Deserialize)]
pub enum QuantityType {
    Number,
    Range, // how to combine ranges?
    Text,
    Empty,
}

#[derive(Serialize, Deserialize)]
pub struct GroupedQuantityKey {
    pub name: String,
    pub unit_type: QuantityType,
}

#[wasm_bindgen]
pub struct GroupedQuantity {
    inner: HashMap<GroupedQuantityKey, Value>
}

#[wasm_bindgen]
impl GroupedQuantity {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            inner: HashMap::new()
        }
    }

    pub fn insert(&mut self, key: GroupedQuantityKey, value: Value) {
        self.inner.insert(key, value);
    }

    pub fn get(&self, key: &GroupedQuantityKey) -> Option<Value> {
        self.inner.get(key).cloned()
    }
}

// Update the from implementation
impl From<[(GroupedQuantityKey, Value); 1]> for GroupedQuantity {
    fn from(arr: [(GroupedQuantityKey, Value); 1]) -> Self {
        let mut map = HashMap::new();
        map.insert(arr[0].0, arr[0].1);
        Self { inner: map }
    }
}

#[wasm_bindgen]
pub struct Amount {
    pub(crate) quantity: Value,
    pub(crate) units: Option<String>,
}

#[wasm_bindgen]
#[derive(Clone)]
pub enum ValueType {
    Number,
    Range,
    Text,
    Empty,
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct Value {
    pub value_type: ValueType,
    pub number_value: Option<f64>,
    pub range_start: Option<f64>,
    pub range_end: Option<f64>,
    pub text_value: Option<String>,
}

#[wasm_bindgen]
#[derive(Default)]
pub struct CooklangMetadata {
    inner: HashMap<String, String>,
}

#[wasm_bindgen]
impl CooklangMetadata {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            inner: HashMap::new()
        }
    }

    pub fn insert(&mut self, key: String, value: String) {
        self.inner.insert(key, value);
    }

    pub fn get(&self, key: &str) -> Option<String> {
        self.inner.get(key).cloned()
    }
}

trait Amountable {
    fn extract_amount(&self) -> Amount;
}

impl Amountable for OriginalQuantity<OriginalScalableValue> {
    fn extract_amount(&self) -> Amount {
        let quantity = extract_quantity(&self.value);

        let units = self.unit().as_ref().map(|u| u.to_string());

        Amount { quantity, units }
    }
}

impl Amountable for OriginalScalableValue {
    fn extract_amount(&self) -> Amount {
        let quantity = extract_quantity(self);

        Amount {
            quantity,
            units: None,
        }
    }
}

fn extract_quantity(value: &OriginalScalableValue) -> Value {
    match value {
        OriginalScalableValue::Fixed(value) => extract_value(value),
        OriginalScalableValue::Linear(value) => extract_value(value),
        OriginalScalableValue::ByServings(values) => extract_value(values.first().unwrap()),
    }
}

fn extract_value(value: &OriginalValue) -> Value {
    match value {
        OriginalValue::Number(num) => Value {
            value_type: ValueType::Number,
            number_value: Some(num.value()),
            range_start: None,
            range_end: None,
            text_value: None,
        },
        OriginalValue::Range { start, end } => Value {
            value_type: ValueType::Range,
            number_value: None,
            range_start: Some(start.value()),
            range_end: Some(end.value()),
            text_value: None,
        },
        OriginalValue::Text(value) => Value {
            value_type: ValueType::Text,
            number_value: None,
            range_start: None,
            range_end: None,
            text_value: Some(value.to_string()),
        },
    }
}

// I(dubadub) haven't found a way to export these methods with mutable argument
pub fn add_to_ingredient_list(
    list: &mut IngredientList,
    name: &String,
    quantity_to_add: &GroupedQuantity,
) {
    if let Some(quantity) = list.inner.get_mut(name) {
        merge_grouped_quantities(quantity, quantity_to_add);
    } else {
        list.inner.insert(name.to_string(), quantity_to_add.clone());
    }
}

// O(n2)? find a better way
pub fn merge_ingredient_lists(left: &mut IngredientList, right: &IngredientList) {
    right.inner
        .iter()
        .for_each(|(ingredient_name, grouped_quantity)| {
            let quantity = left.inner
                .entry(ingredient_name.to_string())
                .or_insert(GroupedQuantity::default());

            merge_grouped_quantities(quantity, grouped_quantity);
        });
}

// I(dubadub) haven't found a way to export these methods with mutable argument
// Right should be always smaller?
pub(crate) fn merge_grouped_quantities(left: &mut GroupedQuantity, right: &GroupedQuantity) {
    // options here:
    // - same units:
    //    - same value type
    //    - not the same value type
    // - different units
    // - no units
    // - no amount
    //
    // \
    //  |- <litre,Number> => 1.2 litre
    //  |- <litre,Text> => half litre
    //  |- <,Text> => pinch
    //  |- <,Empty> => Some
    //
    //
    // TODO define rules on language spec level

    right.iter().for_each(|(key, value)| {
        left
            .entry(key.clone()) // isn't really necessary?
            .and_modify(|v| {
                match key.unit_type {
                    QuantityType::Number => {
                        let Value::Number { value: assignable } = value else { panic!("Unexpected type") };
                        let Value::Number { value: stored } = v else { panic!("Unexpected type") };

                        *stored += assignable
                    },
                    QuantityType::Range => {
                        let Value::Range { start, end } = value else { panic!("Unexpected type") };
                        let Value::Range { start: s, end: e } = v else { panic!("Unexpected type") };

                        // is it even correct?
                        *s += start;
                        *e += end;
                    },
                    QuantityType::Text => {
                        let Value::Text { value: ref assignable } = value else { panic!("Unexpected type") };
                        let Value::Text { value: stored } = v else { panic!("Unexpected type") };

                        *stored += assignable;
                    },
                    QuantityType::Empty => {}, // nothing is required to do, Some + Some = Some

                }
            })
            .or_insert(value.clone());
    });
}

pub(crate) fn into_item(item: &OriginalItem, recipe: &OriginalRecipe) -> Item {
    match item {
        OriginalItem::Text { value } => Item {
            item_type: ItemType::Text,
            text: Some(ItemText {
                value: value.to_string(),
            }),
            ingredient: None,
            cookware: None,
            timer: None,
        },
        OriginalItem::Ingredient { index } => {
            let ingredient = &recipe.ingredients[*index];
            Item {
                item_type: ItemType::Ingredient,
                text: None,
                ingredient: Some(ItemIngredient {
                    name: ingredient.name.clone(),
                    amount: ingredient.quantity.as_ref().map(|q| q.extract_amount()),
                }),
                cookware: None,
                timer: None,
            }
        }
        OriginalItem::Cookware { index } => {
            let cookware = &recipe.cookware[*index];
            Item {
                item_type: ItemType::Cookware,
                text: None,
                ingredient: None,
                cookware: Some(ItemCookware {
                    name: cookware.name.clone(),
                    amount: cookware.quantity.as_ref().map(|q| q.extract_amount()),
                }),
                timer: None,
            }
        }
        OriginalItem::Timer { index } => {
            let timer = &recipe.timers[*index];
            Item {
                item_type: ItemType::Timer,
                text: None,
                ingredient: None,
                cookware: None,
                timer: Some(ItemTimer {
                    name: timer.name.clone(),
                    amount: timer.quantity.as_ref().map(|q| q.extract_amount()),
                }),
            }
        }
        OriginalItem::InlineQuantity { index: _ } => Item {
            item_type: ItemType::Text,
            text: Some(ItemText {
                value: "".to_string(),
            }),
            ingredient: None,
            cookware: None,
            timer: None,
        },
    }
}

pub(crate) fn into_simple_recipe(recipe: &OriginalRecipe) -> CooklangRecipe {
    let mut metadata = CooklangMetadata::new();
    let mut steps: Vec<Step> = Vec::new();
    let mut ingredients: IngredientList = IngredientList::new();
    let mut cookware: Vec<Item> = Vec::new();
    let mut items: Vec<Item> = Vec::new();

    recipe.sections.iter().for_each(|section| {
        section.content.iter().for_each(|content| {
            if let cooklang::Content::Step(step) = content {
                step.items.iter().for_each(|i| {
                    let item = into_item(i, recipe);

                    match item {
                        Item {
                            item_type: ItemType::Ingredient,
                            ingredient: Some(ref ingredient),
                            ..
                        } => {
                            let quantity = into_group_quantity(&ingredient.amount);

                            add_to_ingredient_list(&mut ingredients, &ingredient.name, &quantity);
                        }
                        Item {
                            item_type: ItemType::Cookware,
                            cookware: Some(ref cookware),
                            ..
                        } => {
                            cookware.push(cookware.clone());
                        }
                        // don't need anything if timer or text
                        _ => (),
                    };
                    items.push(item);
                });
                // TODO: think how to make it faster as we probably
                // can switch items content directly into the step object without cloning it
                steps.push(Step {
                    items: items.clone(),
                });

                items.clear();
            }
        });
    });

    recipe.metadata.map.iter().for_each(|(key, value)| {
        metadata.insert(key.to_string(), value.to_string());
    });

    CooklangRecipe {
        metadata,
        steps,
        ingredients,
        cookware,
    }
}
