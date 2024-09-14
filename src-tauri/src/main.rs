// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use core::fmt;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

trait Identifiable {
    fn id(&self) -> &str;
}

trait StackIdentity {
    fn identify(&self) -> Stack;
}

#[derive(Debug)]
enum Stack {
    X,
    Horizontal,
    Vertical,
}

#[derive(Deserialize, Clone)]
struct Position {
    id: String,
    x: u8,
    y: u8,
}

impl Identifiable for Position {
    fn id(&self) -> &str {
        &self.id
    }
}

#[derive(Serialize, Deserialize, Clone)]
struct Probed {
    filename: String,
    dimensions: String,
    duration: u32,
}

#[derive(Serialize, Deserialize, Clone)]
struct Source {
    id: String,
    path: String,
}

impl Identifiable for Source {
    fn id(&self) -> &str {
        &self.id
    }
}

#[derive(Serialize, Deserialize, Clone)]
struct Slider {
    id: String,
    values: [u32; 2],
}

impl Identifiable for Slider {
    fn id(&self) -> &str {
        &self.id
    }
}

enum Inputs {
    Position(Position),
    Source(Source),
    Slider(Slider),
}

impl From<Position> for Inputs {
    fn from(position: Position) -> Inputs {
        Inputs::Position(position)
    }
}

impl From<Source> for Inputs {
    fn from(source: Source) -> Inputs {
        Inputs::Source(source)
    }
}

impl From<Slider> for Inputs {
    fn from(slider: Slider) -> Inputs {
        Inputs::Slider(slider)
    }
}

struct Primed {
    id: String,
    x: u8,
    y: u8,
    path: String,
    start: u32,
    end: u32,
}

impl Default for Primed {
    fn default() -> Self {
        Primed {
            id: String::new(),
            x: 0,
            y: 0,
            path: String::new(),
            start: 0,
            end: 0,
        }
    }
}

impl StackIdentity for Vec<Primed> {
    fn identify(&self) -> Stack {
        if self.iter().all(|item| item.x == 0) {
            return Stack::Vertical;
        }

        if self.iter().all(|item| item.y == 0) {
            return Stack::Horizontal;
        }

        return Stack::X;
    }
}

impl fmt::Display for Primed {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "Id: {} | x: {}, y: {} | path: {} | start: {}, end: {}",
            self.id, self.x, self.y, self.path, self.start, self.end
        )
    }
}

struct Group {
    group: HashMap<String, Vec<Inputs>>,
}

impl Group {
    fn new() -> Group {
        Group {
            group: HashMap::new(),
        }
    }

    fn add<T>(&mut self, v: Vec<T>) -> &mut Group
    where
        T: Identifiable + Into<Inputs>,
    {
        for item in v {
            let id = item.id().to_string();

            self.group.entry(id).or_default().push(item.into())
        }

        self
    }

    fn clean(&mut self) -> &mut Group {
        self.group
            .retain(|_, groups| groups.iter().any(|g| matches!(g, Inputs::Source(_))));

        self
    }

    fn prime(&mut self) -> Vec<Primed> {
        self.group
            .iter()
            .map(|(id, inputs)| {
                let mut primed = Primed::default();
                primed.id = id.to_string();

                for input in inputs {
                    match input {
                        Inputs::Position(pos) => {
                            primed.x = pos.x;
                            primed.y = pos.y;
                        }
                        Inputs::Source(source) => {
                            primed.path = source.path.clone();
                        }
                        Inputs::Slider(slider) => {
                            let [start, end] = slider.values;
                            primed.start = start;
                            primed.end = end;
                        }
                    }
                }
                primed
            })
            .collect()
    }
}

enum Process {
    InProgress,
    Complete,
    UserError,
}

#[tauri::command]
fn process(positions: Vec<Position>, sources: Vec<Source>, sliders: Vec<Slider>) -> String {
    // Clean call ensures no empty items on grid.
    let primed = Group::new()
        .add(positions)
        .add(sources)
        .add(sliders)
        .clean()
        .prime();

    println!("Calling Process stack...");

    if primed.is_empty() {
        println!("Nothing to process!");
        return format!("N/A");
    }

    if primed.len() < 2 {
        println!("Less than 2 items provided!");
        return format!("N/A");
    }

    for item in primed.iter() {
        println!("{}", item)
    }

    let stack = &primed.identify();

    println!("The stack is: {:#?}", stack);

    format!("From rust")
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
