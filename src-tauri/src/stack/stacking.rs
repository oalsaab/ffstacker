use super::priming::{Duration, Primed};
use super::{Execution, Handle};

use core::fmt;
use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};
use std::ffi::OsStr;
use std::fmt::Write;
use std::path::PathBuf;
use std::process::Command;

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

#[derive(Debug, PartialEq)]
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
            "{}xstack=inputs={}:layout='{}'[v]",
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

/// Wrapper for FFmpeg stack execution
pub struct Stacker {
    stack: Stack,
    primed: Vec<Primed>,
    ffmpeg: Command,
    output: String,
}

impl Stacker {
    pub fn new(primed: Vec<Primed>, output: &str) -> Stacker {
        Stacker {
            stack: primed.identify(),
            primed,
            ffmpeg: Command::new("ffmpeg"),
            output: output.to_string(),
        }
    }

    fn arg_trimmings(&mut self) -> &mut Command {
        for prime in self.primed.iter() {
            // Range sliders enforces that start and end always exist together
            if let (Some(start), Some(end)) = (prime.start, prime.end) {
                self.ffmpeg.args(["-ss", &start.as_ts()]);
                self.ffmpeg.args(["to", &end.as_ts()]);
            }
            self.ffmpeg.args(["-i", &prime.path]);
        }

        &mut self.ffmpeg
    }

    fn rand_fname(&self) -> String {
        // https://rust-lang-nursery.github.io/rust-cookbook/algorithms/randomness.html
        let rand_str: String = thread_rng()
            .sample_iter(&Alphanumeric)
            .take(30)
            .map(char::from)
            .collect();

        format!("stacked-{}", rand_str)
    }

    fn output_path(&self) -> String {
        let mut path = PathBuf::from(self.output.clone());
        path.push(format!("{}.mkv", self.rand_fname()));
        path.to_string_lossy().into_owned()
    }
}

impl Execution for Stacker {
    // FFmpeg pipes output to stderr
    const HANDLE: Handle = Handle::Err;

    fn assemble(&mut self) -> &mut Command {
        let n = self.primed.len();

        match self.stack {
            Stack::Horizontal => {
                self.primed.sort_by_key(|f| f.x);
                self.arg_trimmings()
                    .arg("-filter_complex")
                    .arg(format!("hstack=inputs={}", n));
            }
            Stack::Vertical => {
                self.primed.sort_by_key(|f| f.y);
                self.arg_trimmings()
                    .arg("-filter_complex")
                    .arg(format!("vstack=inputs={}", n));
            }
            Stack::X => {
                self.primed.sort_by_key(|f| (f.y, f.x));
                self.arg_trimmings()
                    .arg("-filter_complex")
                    .arg(Xstack::new(n).compose())
                    .args(["-map", "[v]"]);
            } // Row Major Order Mosaic
        }

        self.ffmpeg.arg(self.output_path())
    }
}

impl fmt::Display for Stacker {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let args: Vec<&OsStr> = self.ffmpeg.get_args().collect();
        write!(f, "Args: {:#?}\nIdentity: {:#?}", args, self.stack)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn vstack() -> Vec<Primed> {
        vec![
            Primed {
                x: 0,
                y: 0,
                ..Default::default()
            },
            Primed {
                x: 0,
                y: 1,
                ..Default::default()
            },
        ]
    }

    fn hstack() -> Vec<Primed> {
        vec![
            Primed {
                x: 0,
                y: 0,
                ..Default::default()
            },
            Primed {
                x: 1,
                y: 0,
                ..Default::default()
            },
        ]
    }

    fn xstack() -> Vec<Primed> {
        vec![
            Primed {
                x: 0,
                y: 1,
                path: "1.mov".to_string(),
                ..Default::default()
            },
            Primed {
                x: 1,
                y: 0,
                path: "2.mov".to_string(),
                ..Default::default()
            },
        ]
    }

    #[test]
    fn it_generates_layout() {
        let result = Xstack::new(9).gen_layout();
        let expected = "0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0|0_h0+h1|w0_h0+h1|w0+w1_h0+h1";
        assert_eq!(result, expected)
    }

    #[test]
    fn it_generates_labels() {
        let result = Xstack::new(4).gen_labels();
        let expected = "[0:v][1:v][2:v][3:v]";
        assert_eq!(result, expected)
    }

    #[test]
    fn it_xstack_composes() {
        let result = Xstack::new(4).compose();
        let expected = "[0:v][1:v][2:v][3:v]xstack=inputs=4:layout='0_0|w0_0|0_h0|w0_h0'[v]";
        assert_eq!(result, expected)
    }

    #[test]
    fn it_identifies_stack() {
        assert_eq!(vstack().identify(), Stack::Vertical);
        assert_eq!(hstack().identify(), Stack::Horizontal);
        assert_eq!(xstack().identify(), Stack::X);
    }

    // Generate tests for what the args contain when you get correct output...
    // ...get_args().collect() --> Vec<OsStr> ... assert_eq(args, &["...", "..."])
}
