interface ElementMap {
  [id: string]: React.JSX.Element;
}

interface StackerProps {
  items: Array<{ id: string }>;
  inputs: MutableRefObject<{ id: string; path: string }[]>;
  showSliders: ElementMap;
  sliderValues: SliderValues[];
  showMetadatas: ElementMap;
  showTrimButtons: ElementMap;
  addItem: () => void;
  resetItems: () => void;
  handleFileUpload: (id: string, file: string | string[]) => void;
}

interface ItemProps {
  id: string;
  showSlider: React.JSX.Element;
  sliderValue: SliderValues | null;
  showMetadata: React.JSX.Element;
  showTrimButton: React.JSX.Element;
  handleFileUpload: (id: string, file: string | string[]) => void;
}

interface TrimmerButtonProps {
  id: string;
  probed: Probed;
  handleTrimButton: (id: string, probed: Probed) => void;
}

interface TrimmerProps {
  id: string;
  probed: Probed;
  handleSliderChangeEnd: (id: string, value: [number, number]) => void;
}

interface MetadataProps {
  probed: Probed;
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
