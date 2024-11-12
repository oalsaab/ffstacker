// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod stack;

use serde::{Deserialize, Serialize};
use stack::{Execution, ProbedDimensions, StackIdentity};

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "UPPERCASE")]
enum Status {
    Success,
    Failed,
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
    probes: Vec<stack::Probed>,
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
    println!("{:#?}", probes);

    match primed.identify() {
        stack::Stack::Vertical => {
            if !probes.is_same_width() {
                return ProcessResult {
                    status: Status::Failed,
                    message: String::from(
                        "Not able to process vertical stack with mismatched width",
                    ),
                };
            }
        }
        stack::Stack::Horizontal => {
            if !probes.is_same_height() {
                return ProcessResult {
                    status: Status::Failed,
                    message: String::from(
                        "Not able to process horizontal stack with mismatched height",
                    ),
                };
            }
        }
        stack::Stack::X => {
            if !probes.is_same_dimensions() {
                return ProcessResult {
                    status: Status::Failed,
                    message: String::from("Not able to process X stack with mismatched dimensions"),
                };
            }
        }
    }

    // Debug
    println!("Calling Process stack...");

    // Debug
    for item in primed.iter() {
        println!("{}", item)
    }

    let mut stacker = stack::Stacker::new(primed, &output);

    match stacker.execute() {
        Ok(_) => ProcessResult {
            status: Status::Success,
            message: format!("Saved stacked file to: {}", stacker.output_path()),
        },
        Err(err) => ProcessResult {
            status: Status::Failed,
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
