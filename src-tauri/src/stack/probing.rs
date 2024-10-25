use serde::{Deserialize, Serialize};
use std::process::{Command, Stdio};

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

pub enum ProbeError {
    Spawn,
    OutputWait,
    FFprobe,
}

/// Represent output of executing FFprobe
#[derive(Debug, Default, Serialize, Clone)]
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

    fn probe(&mut self) {
        self.ffprobe
            .args(["-v", "quiet"])
            .args(["-print_format", "json"])
            .arg("-show_format")
            .arg("-show_streams")
            .args(["-select_streams", "v:0"])
            .arg(&self.input);
    }

    pub fn execute(&mut self) -> Result<Vec<u8>, ProbeError> {
        self.probe();
        let spawned = self.ffprobe.stdout(Stdio::piped()).spawn();

        let output = match spawned {
            Ok(child) => child.wait_with_output(),
            Err(e) => {
                eprintln!("Spawning ffprobe failed: {e}");
                return Err(ProbeError::Spawn);
            }
        };

        let out = match output {
            Ok(out) => out,
            Err(e) => {
                eprintln!("Failed to wait on child: {e}");
                return Err(ProbeError::OutputWait);
            }
        };

        match out.status.success() {
            true => Ok(out.stdout),
            false => {
                eprintln!("Probing failed with code: {:?}", out.status.code());
                Err(ProbeError::FFprobe)
            }
        }
    }
}
