use crate::priming::Primed;
use std::{fmt::format, process::Command};
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

struct Stacker {
    stack: Stack,
    primed: Vec<Primed>,
    ffmpeg: Command,
}

struct Xstack {
    inputs: usize,
}

impl Xstack {
    fn generate(&self) -> String {
        todo!()
    }
}

impl Stacker {
    fn build(&self, stack: Stack, primed: Vec<Primed>) -> Stacker {
        Stacker {
            stack,
            primed,
            ffmpeg: Command::new("ffmpeg"),
        }
    }

    fn input_arg(&self) -> String {
        let inputs = self.primed.len();

        match self.stack {
            Stack::Horizontal => format!("hstack=inputs={}", inputs),
            Stack::Vertical => format!("vstack=inputs={}", inputs),
            Stack::X => Xstack { inputs }.generate(),
        }
    }

    fn hstack(&mut self) {
        self.primed.sort_by_key(|f| f.x);
    }

    fn vstack(&mut self) {
        self.primed.sort_by_key(|f| f.y);
    }

    fn xstack(&mut self) {
        // Row Major Order Mosaic
        self.primed.sort_by_key(|f| (f.y, f.x));
    }

    fn stack(&mut self) {
        match self.stack {
            Stack::Horizontal => self.hstack(),
            Stack::Vertical => self.vstack(),
            Stack::X => self.xstack(),
        }

        for prime in self.primed.iter() {
            self.ffmpeg.args(["-i", &prime.path]);
            self.ffmpeg.args(["-ss", &prime.start.to_string()]);
            self.ffmpeg.args(["-to", &prime.end.to_string()]);
        }

        self.ffmpeg.arg("-filter_complex");
        self.ffmpeg.arg(&self.input_arg());
        self.ffmpeg.arg("output.mkv");
    }
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

fn gen_layout(n: usize) -> String {
    let cols = (n as f64).sqrt().floor() as usize;

    (0..n)
        .map(|idx| {
            let (row, col) = (idx / cols, idx % cols);

            let x_offset = gen_offset("w".into(), col);

            let y_offset = gen_offset("h".into(), row);

            format!("{}_{}", x_offset, y_offset)
        })
        .collect::<Vec<_>>()
        .join("|")
}

fn gen_labels(n: usize) -> String {
    (0..n).map(|idx| format!("[{}:v]", idx)).collect()
}

#[test]
fn test_xstack() {
    let result = gen_layout(36);
    let expected = "0_0|w0_0|w0+w1_0|w0+w1+w2_0|w0+w1+w2+w3_0|w0+w1+w2+w3+w4_0|0_h0|w0_h0|w0+w1_h0|w0+w1+w2_h0|w0+w1+w2+w3_h0|w0+w1+w2+w3+w4_h0|0_h0+h1|w0_h0+h1|w0+w1_h0+h1|w0+w1+w2_h0+h1|w0+w1+w2+w3_h0+h1|w0+w1+w2+w3+w4_h0+h1|0_h0+h1+h2|w0_h0+h1+h2|w0+w1_h0+h1+h2|w0+w1+w2_h0+h1+h2|w0+w1+w2+w3_h0+h1+h2|w0+w1+w2+w3+w4_h0+h1+h2|0_h0+h1+h2+h3|w0_h0+h1+h2+h3|w0+w1_h0+h1+h2+h3|w0+w1+w2_h0+h1+h2+h3|w0+w1+w2+w3_h0+h1+h2+h3|w0+w1+w2+w3+w4_h0+h1+h2+h3|0_h0+h1+h2+h3+h4|w0_h0+h1+h2+h3+h4|w0+w1_h0+h1+h2+h3+h4|w0+w1+w2_h0+h1+h2+h3+h4|w0+w1+w2+w3_h0+h1+h2+h3+h4|w0+w1+w2+w3+w4_h0+h1+h2+h3+h4";
    assert_eq!(result, expected)
}

#[test]
fn test_labels() {
    let result = gen_labels(4);
    let expected = "[0:v][1:v][2:v][3:v]".to_string();
    assert_eq!(result, expected)
}
