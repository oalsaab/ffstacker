interface StackerProps {
  items: Array<{ id: string }>;
  inputs: MutableRefObject<{ id: string; path: string }[]>;
  showSliders: { [key: string]: JSX.Element };
  sliderValues: SliderValues[];
  addItem: () => void;
  resetItems: () => void;
  handleFileUpload: (id: string, file: string | string[]) => void;
}

interface ItemProps {
  id: string;
  showSlider: JSX.Element;
  handleFileUpload: (id: string, file: string | string[]) => void;
}

interface SliderValues {
  id: string;
  values: [number, number];
}

// Tauri serialised return types
interface Probed {
  filename: string;
  dimensions: string;
  duration: number;
}