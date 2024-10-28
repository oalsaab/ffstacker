mod grouping;
mod priming;
mod probing;
mod stacking;

pub use grouping::{Group, Position, Slider, Source};
pub use probing::{Probe, Probed};
pub use stacking::Stacker;

use std::process::{Command, Stdio};

#[derive(Debug)]
pub enum ExecuteError {
    Spawn,
    OutputWait,
    Execution,
}

pub trait Execution {
    fn assemble(&mut self) -> &mut Command;

    fn execute(&mut self) -> Result<Vec<u8>, ExecuteError> {
        let ff = self.assemble();
        let spawned = ff.stdout(Stdio::piped()).spawn();

        let output = match spawned {
            Ok(child) => child.wait_with_output(),
            Err(e) => {
                eprintln!("Spawning command failed: {e}");
                return Err(ExecuteError::Spawn);
            }
        };

        let out = match output {
            Ok(out) => out,
            Err(e) => {
                eprintln!("Failed to wait on child: {e}");
                return Err(ExecuteError::OutputWait);
            }
        };

        match out.status.success() {
            true => Ok(out.stdout),
            false => {
                let code = out
                    .status
                    .code()
                    .and_then(|f| Some(f.to_string()))
                    .unwrap_or("unknown".into());

                eprintln!("Command failed with code: {}", code);
                Err(ExecuteError::Execution)
            }
        }
    }
}
