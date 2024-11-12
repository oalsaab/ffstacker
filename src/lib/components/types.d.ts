interface ElementMap {
  [id: string]: React.JSX.Element;
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
