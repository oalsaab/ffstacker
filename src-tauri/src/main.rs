// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Deserialize;

#[derive(Deserialize, Clone)]
struct Item {
    id: String,
    x: u8,
    y: u8,
    content: String,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn process_stack(stack: Vec<Item>) -> String {
    let item = stack.first();

    let result = match item {
        Some(item) => item.id.clone(),
        None => String::from("No value!"),
    };

    format!("From rust, first ID: {}", result)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![process_stack])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
