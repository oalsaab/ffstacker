mod grouping;
mod priming;
mod probing;
mod stacking;

pub use grouping::{Group, Position, Slider, Source};
pub use probing::{Probe, Probed, ProbedDimensions};
pub use stacking::{Stack, StackIdentity, Stacker};

use log::error;
use std::process::{Command, Stdio};

#[derive(Debug)]
pub enum ExecuteError {
    Spawn,
    OutputWait,
    Execution,
}

pub enum Handle {
    Out,
    Err,
}

pub trait Execution {
    const HANDLE: Handle;

    fn assemble(&mut self) -> &mut Command;

    fn execute(&mut self) -> Result<Vec<u8>, ExecuteError> {
        let ff = self.assemble();
        let ff = match Self::HANDLE {
            Handle::Out => ff.stdout(Stdio::piped()),
            Handle::Err => ff.stderr(Stdio::piped()),
        };

        let output = match ff.spawn() {
            Ok(child) => match child.wait_with_output() {
                Ok(out) => out,
                Err(e) => {
                    error!("Failed to wait on child: {e}");
                    return Err(ExecuteError::OutputWait);
                }
            },
            Err(e) => {
                error!("Spawning command failed: {e}");
                return Err(ExecuteError::Spawn);
            }
        };

        match output.status.success() {
            true => Ok(output.stdout),
            false => {
                let code = output
                    .status
                    .code()
                    .map(|f| f.to_string())
                    .unwrap_or(String::from("unknown"));

                error!("Command failed with code: {}", code);
                Err(ExecuteError::Execution)
            }
        }
    }
}
