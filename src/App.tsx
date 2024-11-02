import { useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import {
  RangeSlider,
  HoverCard,
  Stack,
  Center,
  Text,
  Group,
  ActionIcon,
} from "@mantine/core";
import "./App.css";
import "gridstack/dist/gridstack.min.css";
import "gridstack/dist/gridstack-extra.min.css";
import "@mantine/core/styles.css";
import { IconInfoCircle } from "@tabler/icons-react";

import Stacker from "./lib/components/Stacker";
import Trimmer from "./lib/components/Trimmer";

function valueLabelFormat(value: number) {
  return new Date(value * 1000).toISOString().slice(11, 19);
}

const StackManager: React.FC = () => {
  const initialItems = [{ id: "1" }, { id: "2" }];
  const [items, setItems] = useState(initialItems);
  const [sliderValues, setSliderValue] = useState<SliderValues[]>([]);
  const [showSliders, setShowSlider] = useState<{ [key: string]: JSX.Element }>(
    {},
  );

  const inputs = useRef<{ id: string; path: string }[]>([]);

  const addItem = () => {
    setItems([...items, { id: `${items.length + 1}` }]);
  };

  const resetItems = () => {
    inputs.current = [];
    setItems(initialItems);
    setShowSlider({});
    setSliderValue([]);
  };

  const handleSliderChangeEnd = (id: string, value: [number, number]) => {
    setSliderValue((prevValues) =>
      prevValues.map((slider) =>
        slider.id === id ? { ...slider, values: value } : slider,
      ),
    );
  };

  const handleFileUpload = async (id: string, file: string | string[]) => {
    if (Array.isArray(file)) {
      return;
    }

    const path = file;
    const entry = inputs.current.find((input) => input.id === id);

    if (entry) {
      entry.path = path;
    } else {
      inputs.current.push({ id, path });
    }

    let probed: Probed = await invoke("probe", { input: path });

    setSliderValue((prev) => [...prev, { id, values: [0, probed.duration] }]);

    setShowSlider((prev) => ({
      ...prev,
      [id]: (
        <Trimmer
          id={id}
          probed={probed}
          handleSliderChangeEnd={handleSliderChangeEnd}
        ></Trimmer>
      ),
    }));
  };

  return (
    <Stacker
      items={items}
      addItem={addItem}
      resetItems={resetItems}
      showSliders={showSliders}
      sliderValues={sliderValues}
      inputs={inputs}
      handleFileUpload={handleFileUpload}
    />
  );
};

// App component to be called from Tauri
const App: React.FC = () => {
  return (
    <div>
      <Center>
        <h1>Stacker</h1>
      </Center>
      <StackManager />
    </div>
  );
};

export default App;
