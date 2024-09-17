use core::fmt;

pub trait StackIdentity {
    fn identify(&self) -> Stack;
}

impl StackIdentity for Vec<Primed> {
    fn identify(&self) -> Stack {
        if self.iter().all(|item| item.x == 0) {
            return Stack::Vertical;
        }

        if self.iter().all(|item| item.y == 0) {
            return Stack::Horizontal;
        }

        Stack::X
    }
}

#[derive(Debug)]
pub enum Stack {
    X,
    Horizontal,
    Vertical,
}

#[derive(Default)]
pub struct Primed {
    pub id: String,
    pub x: u8,
    pub y: u8,
    pub path: String,
    pub start: u32,
    pub end: u32,
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
