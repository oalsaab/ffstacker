interface ElementMap {
  [id: string]: React.JSX.Element;
}

interface ProbedMap {
  [id: string]: Probed;
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
