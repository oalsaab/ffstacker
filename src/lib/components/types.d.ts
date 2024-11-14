interface ElementMap {
  [id: string]: React.JSX.Element;
}

interface ProbeResults {
  [id: string]: ProbeResult;
}

interface SliderValues {
  id: string;
  values: [number, number];
}

// Tauri serialised return types
interface Probed {
  filename: string;
  duration: number;
  width: number;
  height: number;
}

type Status = "SUCCESS" | "FAILED";

interface ProcessResult {
  status: Status;
  message: string;
}

interface ProbeResult {
  status: Status;
  message: string;
  probed: Probed;
}
