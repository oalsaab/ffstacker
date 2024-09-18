use core::fmt;

#[derive(Default)]
pub struct Primed {
    pub id: String,
    pub x: u8,
    pub y: u8,
    pub path: String,
    pub start: u32,
    pub end: u32,
}

impl Primed {
    pub fn start_as_ts(&self) -> String {
        todo!()
    }

    pub fn end_as_ts(&self) -> String {
        todo!()
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
