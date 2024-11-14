// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod stack;

use log::debug;
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

#[derive(Deserialize, Serialize)]
struct ProbeResult {
    status: Status,
    message: String,
    probed: stack::Probed,
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

    debug!("Probes: {:#?}", probes);

    match primed.identify() {
        stack::Stack::Vertical => {
            if !probes.is_same_width() {
                return ProcessResult {
                    status: Status::Failed,
                    message: String::from("Unable to process vertical stack with mismatched width"),
                };
            }
        }
        stack::Stack::Horizontal => {
            if !probes.is_same_height() {
                return ProcessResult {
                    status: Status::Failed,
                    message: String::from(
                        "Unable to process horizontal stack with mismatched height",
                    ),
                };
            }
        }
        stack::Stack::X => {
            if !probes.is_same_dimensions() {
                return ProcessResult {
                    status: Status::Failed,
                    message: String::from("Unable to process X stack with mismatched dimensions"),
                };
            }
        }
    }

    let mut stacker = stack::Stacker::new(primed, &output);
    debug!("Stacker CMD: {}", stacker);

    match stacker.execute() {
        Ok(_) => ProcessResult {
            status: Status::Success,
            message: format!("Saved stacked file to: {}", stacker.output_path()),
        },
        Err(e) => ProcessResult {
            status: Status::Failed,
            message: format!("Stacking failed: {:#?}", e),
        },
    }
}

#[tauri::command]
fn probe(input: String) -> ProbeResult {
    debug!("Input: {}", input);

    match stack::Probe::new(&input).execute() {
        Ok(stdout) => match stack::Probed::build(&stdout) {
            Ok(probed) => ProbeResult {
                status: Status::Success,
                message: String::from("Succesful probe"),
                probed,
            },
            Err(e) => ProbeResult {
                status: Status::Failed,
                message: format!("Failed probing: {}", e),
                probed: stack::Probed::default(),
            },
        },
        Err(e) => ProbeResult {
            status: Status::Failed,
            message: format!("Failed executing FFprobe: {:#?}", e),
            probed: stack::Probed::default(),
        },
    }
}

fn main() {
    env_logger::init();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![process, probe])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
