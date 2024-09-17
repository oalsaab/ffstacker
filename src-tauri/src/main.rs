// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod grouping;
mod priming;
mod probing;

use grouping::Group;
use probing::Probed;

use crate::priming::StackIdentity;

// enum Process {
//     InProgress,
//     Complete,
//     UserError,
// }

#[tauri::command]
fn process(
    positions: Vec<grouping::Position>,
    sources: Vec<grouping::Source>,
    sliders: Vec<grouping::Slider>,
) -> String {
    // Clean call ensures no empty items on grid.
    let primed = Group::new()
        .add(positions)
        .add(sources)
        .add(sliders)
        .clean()
        .prime();

    println!("Calling Process stack...");

    for item in primed.iter() {
        println!("{}", item)
    }

    let stack = &primed.identify();

    println!("The stack is: {:#?}", stack);

    "From rust".to_string()
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
        .invoke_handler(tauri::generate_handler![process, probe])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
