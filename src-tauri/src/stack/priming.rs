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
    pub start: Option<u32>,
    pub end: Option<u32>,
}

impl fmt::Display for Primed {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let fmt_ts = |dur: Option<u32>| dur.map(|v| v.as_ts()).unwrap_or(String::from("Not set"));
        let (start, end) = (fmt_ts(self.start), fmt_ts(self.end));

        write!(
            f,
            "Id: {} | x: {}, y: {} | path: {} | start: {}, end: {}",
            self.id, self.x, self.y, self.path, start, end
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_creates_as_ts() {
        let primed = Primed {
            start: Some(2341),
            end: Some(4123),
            ..Default::default()
        };

        assert_eq!(primed.start.unwrap().as_ts(), "00:39:01");
        assert_eq!(primed.end.unwrap().as_ts(), "01:08:43");
    }
}
