use super::{Execution, Handle};

use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Deserialize)]
struct ProbeOutput {
    streams: Vec<Stream>,
    format: Format,
}

#[derive(Deserialize)]
struct Stream {
    width: u16,
    height: u16,
    duration: Option<String>,
}
#[derive(Deserialize)]
struct Format {
    filename: String,
    duration: String,
}

/// Represent output of executing FFprobe
#[derive(Debug, Default, Serialize, Deserialize, Clone)]
pub struct Probed {
    pub filename: String,
    pub duration: f64,
    pub height: u16,
    pub width: u16,
}

impl Probed {
    pub fn build(stdout: &[u8]) -> Result<Probed, serde_json::Error> {
        let output: ProbeOutput = serde_json::from_slice(stdout)?;

        match output.streams.first() {
            Some(stream) => {
                // Output of FFprobe should always give us some float string duration
                let duration = &stream
                    .duration
                    .as_ref()
                    .unwrap_or(&output.format.duration)
                    .parse::<f64>()
                    .unwrap();

                Ok(Probed {
                    filename: output.format.filename,
                    duration: *duration,
                    height: stream.height,
                    width: stream.width,
                })
            }
            None => Ok(Probed::default()),
        }
    }
}

/// Wrapper for FFprobe execution
pub struct Probe {
    input: String,
    ffprobe: Command,
}

impl Probe {
    pub fn new(input: &str) -> Probe {
        Probe {
            input: input.into(),
            ffprobe: Command::new("ffprobe"),
        }
    }
}

impl Execution for Probe {
    // FFprobe pipes output to stdout
    const HANDLE: Handle = Handle::Out;

    fn assemble(&mut self) -> &mut Command {
        self.ffprobe
            .args(["-v", "quiet"])
            .args(["-print_format", "json"])
            .arg("-show_format")
            .arg("-show_streams")
            .args(["-select_streams", "v:0"])
            .arg(&self.input)
    }
}

pub trait ProbedDimensions {
    fn is_same_width(&self) -> bool;
    fn is_same_height(&self) -> bool;
    fn is_same_dimensions(&self) -> bool;
}

impl ProbedDimensions for Vec<Probed> {
    fn is_same_width(&self) -> bool {
        self.windows(2).all(|p| p[0].width == p[1].width)
    }

    fn is_same_height(&self) -> bool {
        self.windows(2).all(|p| p[0].height == p[1].height)
    }

    fn is_same_dimensions(&self) -> bool {
        self.windows(2)
            .all(|p| (p[0].width, p[0].height) == (p[1].width, p[1].height))
    }
}
