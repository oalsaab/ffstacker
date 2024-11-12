// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod stack;
use stack::Execution;

use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
enum Status {
    SUCCESS,
    FAILED,
}

#[derive(Deserialize, Serialize)]
struct ProcessResult {
    status: Status,
    message: String,
}

// Command needs to be async to handle "hanging" of GUI
#[tauri::command(async)]
fn process(
    positions: Vec<stack::Position>,
    sources: Vec<stack::Source>,
    sliders: Vec<Option<stack::Slider>>,
    output: String,
) -> ProcessResult {
    // Clean call ensures no empty items on grid.
    let primed = stack::Group::new()
        .add(positions)
        .add(sources)
        .add_optional(sliders)
        .clean()
        .prime();

    // Debug
    println!("Calling Process stack...");

    // Debug
    for item in primed.iter() {
        println!("{}", item)
    }

    let mut stacker = stack::Stacker::new(primed, &output);

    match stacker.execute() {
        Ok(_) => ProcessResult {
            status: Status::SUCCESS,
            message: format!("Saved stacked file to: {}", stacker.output_path()),
        },
        Err(err) => ProcessResult {
            status: Status::FAILED,
            message: format!("Stacking failed due to err: {:#?}", err),
        },
    }
}

#[tauri::command]
fn probe(input: String) -> stack::Probed {
    println!("Input received: {}", input);

    // Using default is misleading GUI frontend on any errs?
    match stack::Probe::new(&input).execute() {
        Ok(stdout) => match stack::Probed::build(&stdout) {
            Ok(probed) => probed,
            Err(e) => {
                eprintln!("Failed to build probed output: {e}");
                stack::Probed::default()
            }
        },
        Err(_) => {
            eprintln!("Failed to execute FFprobe");
            stack::Probed::default()
        }
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![process, probe])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
