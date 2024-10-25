use core::fmt;

pub trait Duration {
    fn as_ts(&self) -> String;
}

impl Duration for u32 {
    fn as_ts(&self) -> String {
        let (seconds, minutes, hours) = (self % 60, (self / 60) % 60, (self / 60 / 60));
        format!("{:0>2}:{:0>2}:{:0>2}", hours, minutes, seconds)
    }
}

/// The result of grouping GUI input by ID
#[derive(Debug, PartialEq, Default)]
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_as_ts() {
        let primed = Primed {
            start: 2341,
            end: 4123,
            ..Default::default()
        };

        assert_eq!(primed.start.as_ts(), "00:39:01");
        assert_eq!(primed.end.as_ts(), "01:08:43");
    }
}
