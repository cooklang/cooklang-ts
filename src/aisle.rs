use wasm_bindgen::prelude::*;
use std::collections::HashMap;

use cooklang::aisle::Category as OriginalAisleCategory;

#[wasm_bindgen]
pub struct AisleIngredient {
    pub name: String,
    pub aliases: Vec<String>,
}

#[wasm_bindgen]
pub struct AisleReverseCategory {
    map: HashMap<String, String>,
}

#[wasm_bindgen]
impl AisleReverseCategory {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            map: HashMap::new()
        }
    }

    pub fn get(&self, key: &str) -> Option<String> {
        self.map.get(key).cloned()
    }

    pub fn insert(&mut self, key: String, value: String) {
        self.map.insert(key, value);
    }
}

#[wasm_bindgen]
pub struct AisleCategory {
    pub name: String,
    pub ingredients: Vec<AisleIngredient>,
}

#[wasm_bindgen]
pub struct AisleConf {
    pub categories: Vec<AisleCategory>,
    pub cache: AisleReverseCategory,
}

#[wasm_bindgen]
impl AisleConf {
    pub fn category_for(&self, ingredient_name: String) -> Option<String> {
        self.cache.get(&ingredient_name)
    }
}

pub fn into_category(original: &OriginalAisleCategory) -> AisleCategory {
    let mut ingredients: Vec<AisleIngredient> = Vec::new();

    original.ingredients.iter().for_each(|i| {
        let mut it = i.names.iter();

        let name = it.next().unwrap().to_string();
        let aliases: Vec<String> = it.map(|v| v.to_string()).collect();

        ingredients.push(AisleIngredient { name, aliases });
    });

    AisleCategory {
        name: original.name.to_string(),
        ingredients,
    }
}
