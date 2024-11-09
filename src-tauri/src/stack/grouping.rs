use serde::Deserialize;
use std::collections::HashMap;

use super::priming::Primed;

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

#[derive(Default, Deserialize, Clone, Debug)]
pub struct Position {
    id: String,
    x: u8,
    y: u8,
}

#[derive(Default, Deserialize, Clone, Debug)]
pub struct Source {
    id: String,
    path: String,
}

#[derive(Default, Deserialize, Clone, Debug)]
pub struct Slider {
    id: String,
    values: [f64; 2],
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

/// Group the Position, Slider, and Source values received from the GUI
pub struct Group {
    group: HashMap<String, Vec<Inputs>>,
}

impl Group {
    pub fn new() -> Group {
        Group {
            group: HashMap::new(),
        }
    }

    fn push_value<T>(&mut self, value: T)
    where
        T: Identifiable + Into<Inputs>,
    {
        let id = value.id().to_string();
        self.group.entry(id).or_default().push(value.into())
    }

    pub fn add<T>(&mut self, values: Vec<T>) -> &mut Group
    where
        T: Identifiable + Into<Inputs>,
    {
        values.into_iter().for_each(|value| {
            self.push_value(value);
        });
        self
    }

    pub fn add_optional<T>(&mut self, values: Vec<Option<T>>) -> &mut Group
    where
        T: Identifiable + Into<Inputs>,
    {
        values.into_iter().flatten().for_each(|value| {
            self.push_value(value);
        });

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
                            primed.start = Some(start as u32);
                            primed.end = Some(end as u32);
                        }
                    }
                }
                primed
            })
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_groups() {
        let primed = Group::new()
            .add(vec![Position {
                id: String::from("1"),
                x: 0,
                y: 1,
            }])
            .add(vec![Source {
                id: String::from("1"),
                path: String::from("x.mov"),
            }])
            .add_optional(vec![Some(Slider {
                id: String::from("1"),
                values: [10.0, 20.0],
            })])
            .clean()
            .prime();

        let result = primed.first().unwrap();

        assert_eq!(
            result,
            &Primed {
                id: String::from("1"),
                x: 0,
                y: 1,
                path: String::from("x.mov"),
                start: Some(10),
                end: Some(20)
            }
        )
    }
}
