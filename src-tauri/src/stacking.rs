use crate::priming::Primed;

use std::fmt::Write;
use std::io;
use std::process::{Child, Command};
pub trait StackIdentity {
    fn identify(&self) -> Stack;
}

// Trait extension for learning purposes to see learn it's capabilities
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

struct Xstack {
    n: usize,
}

impl Xstack {
    fn new(n: usize) -> Xstack {
        Xstack { n }
    }

    fn compose(&self) -> String {
        format!(
            "'{}xstack=inputs={}:layout={}[v]' -map '[v]'",
            self.gen_labels(),
            self.n,
            self.gen_layout()
        )
    }

    fn gen_offset(char: String, offset: usize) -> String {
        if offset == 0 {
            return "0".into();
        }

        (0..offset)
            .map(|x| format!("{}{}", char, x))
            .collect::<Vec<_>>()
            .join("+")
    }

    fn gen_labels(&self) -> String {
        (0..self.n).fold(String::new(), |mut output, idx| {
            let _ = write!(output, "[{idx}:v]");
            output
        })
    }

    fn gen_layout(&self) -> String {
        let cols = (self.n as f64).sqrt().floor() as usize;

        (0..self.n)
            .map(|idx| {
                let (row, col) = (idx / cols, idx % cols);

                let x_offset = Xstack::gen_offset("w".into(), col);
                let y_offset = Xstack::gen_offset("h".into(), row);

                format!("{}_{}", x_offset, y_offset)
            })
            .collect::<Vec<_>>()
            .join("|")
    }
}

pub struct Stacker {
    stack: Stack,
    primed: Vec<Primed>,
    ffmpeg: Command,
}

impl Stacker {
    pub fn new(primed: Vec<Primed>) -> Stacker {
        Stacker {
            stack: primed.identify(),
            primed,
            ffmpeg: Command::new("ffmpeg"),
        }
    }

    fn add_inputs(&mut self) {
        for prime in self.primed.iter() {
            self.ffmpeg.args(["-i", &prime.path]);
            self.ffmpeg.args(["-ss", &prime.start.to_string()]);
            self.ffmpeg.args(["-to", &prime.end.to_string()]);
        }
    }

    fn stack(&mut self) {
        let n = self.primed.len();

        match self.stack {
            Stack::Horizontal => {
                self.primed.sort_by_key(|f| f.x);
                self.add_inputs();
                self.ffmpeg.arg("-filter_complex");
                self.ffmpeg.arg(format!("hstack=inputs={}", n));
            }
            Stack::Vertical => {
                self.primed.sort_by_key(|f| f.y);
                self.add_inputs();
                self.ffmpeg.arg("-filter_complex");
                self.ffmpeg.arg(format!("vstack=inputs={}", n));
            }
            Stack::X => {
                self.primed.sort_by_key(|f| (f.y, f.x));
                self.add_inputs();
                self.ffmpeg.arg("-filter_complex");
                self.ffmpeg.arg(&Xstack::new(n).compose());
            } // Row Major Order Mosaic
        }

        self.ffmpeg.arg("output.mkv");
    }

    pub fn execute(&mut self) -> io::Result<Child> {
        self.stack();
        self.ffmpeg.spawn()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_generates_layout() {
        let result = Xstack::new(9).gen_layout();
        let expected = "0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0|0_h0+h1|w0_h0+h1|w0+w1_h0+h1";
        assert_eq!(result, expected)
    }

    #[test]
    fn it_generates_labels() {
        let result = Xstack::new(4).gen_labels();
        let expected = "[0:v][1:v][2:v][3:v]".to_string();
        assert_eq!(result, expected)
    }

    #[test]
    fn it_xstack_composes() {
        let result = Xstack::new(4).compose();
        let expected =
            "'[0:v][1:v][2:v][3:v]xstack=inputs=4:layout=0_0|w0_0|0_h0|w0_h0[v]' -map '[v]'"
                .to_string();
        assert_eq!(result, expected)
    }
}
