// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};

#[derive(Deserialize, Clone)]
struct Item {
    id: String,
    x: u8,
    y: u8,
    content: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct Probed {
    filename: String,
    dimensions: String,
    duration: u32,
}

#[derive(Serialize, Deserialize, Clone)]
struct Input {
    id: String,
    path: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct Slider {
    id: String,
    values: [u32; 2],
}

#[tauri::command]
fn process_stack(stack: Vec<Item>, inputs: Vec<Input>, sliders: Vec<Slider>) -> String {
    let item = stack.first();
    let input = inputs.first();
    let slider = sliders.first();

    let id_value = match item {
        Some(item) => item.id.clone(),
        None => String::from("No ID value!"),
    };

    let input_value = match input {
        Some(input) => input.path.clone(),
        None => String::from("No input path!"),
    };

    let slider_value = match slider {
        Some(slider) => {
            let [start, end] = slider.values;
            format!("Start: {} | End: {}", start, end)
        }
        None => String::from("No slider values!"),
    };

    format!(
        "From rust, first ID: {} | Input value path: {} | Slider Values: {}",
        id_value, input_value, slider_value
    )
}

#[tauri::command]
fn probe(input: String) -> Probed {
    println!("Input received: {}", input);

    Probed {
        filename: "beef.mov".into(),
        dimensions: "420x420".into(),
        duration: 1000,
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![process_stack, probe])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
