use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::priming::Primed;

pub trait Identifiable {
    fn id(&self) -> &str;
}

impl Identifiable for Slider {
    fn id(&self) -> &str {
        &self.id
    }
}

impl Identifiable for Position {
    fn id(&self) -> &str {
        &self.id
    }
}

impl Identifiable for Source {
    fn id(&self) -> &str {
        &self.id
    }
}

#[derive(Deserialize, Clone)]
pub struct Position {
    id: String,
    x: u8,
    y: u8,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Source {
    id: String,
    path: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Slider {
    id: String,
    values: [u32; 2],
}

pub enum Inputs {
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

pub struct Group {
    group: HashMap<String, Vec<Inputs>>,
}

impl Group {
    pub fn new() -> Group {
        Group {
            group: HashMap::new(),
        }
    }

    pub fn add<T>(&mut self, v: Vec<T>) -> &mut Group
    where
        T: Identifiable + Into<Inputs>,
    {
        for item in v {
            let id = item.id().to_string();

            self.group.entry(id).or_default().push(item.into())
        }

        self
    }

    pub fn clean(&mut self) -> &mut Group {
        self.group
            .retain(|_, groups| groups.iter().any(|g| matches!(g, Inputs::Source(_))));

        self
    }

    pub fn prime(&mut self) -> Vec<Primed> {
        self.group
            .iter()
            .map(|(id, inputs)| {
                let mut primed = Primed {
                    id: id.to_string(),
                    ..Default::default()
                };

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
