use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Probed {
    pub filename: String,
    pub dimensions: String,
    pub duration: u32,
}
