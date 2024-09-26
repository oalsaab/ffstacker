// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod stack;

// enum Process {
//     InProgress,
//     Complete,
//     UserError,
// }

#[tauri::command]
fn process(
    positions: Vec<stack::Position>,
    sources: Vec<stack::Source>,
    sliders: Vec<stack::Slider>,
) -> String {
    // Clean call ensures no empty items on grid.
    let primed = stack::Group::new()
        .add(positions)
        .add(sources)
        .add(sliders)
        .clean()
        .prime();

    println!("Calling Process stack...");

    for item in primed.iter() {
        println!("{}", item)
    }

    // stack::Stacker::new(primed).execute().unwrap();

    "From rust".to_string()
}

#[tauri::command]
fn probe(input: String) -> stack::Probed {
    println!("Input received: {}", input);

    stack::Probed {
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
