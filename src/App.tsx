import { Center, Group } from "@mantine/core";
import "@mantine/core/styles.css";
import { invoke } from "@tauri-apps/api/tauri";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack-extra.min.css";
import "gridstack/dist/gridstack.min.css";
import { useRef, useState } from "react";
import "./App.css";
import {
  AddButton,
  ProcessButton,
  ResetButton,
} from "./lib/components/ControlButtons";
import Metadata from "./lib/components/Metadata";
import Stacker from "./lib/components/Stacker";
import { Trimmer, TrimmerButton, TrimmerText } from "./lib/components/Trimmer";

const StackManager: React.FC = () => {
  const [items, setItems] = useState<{ id: string }[]>([]);
  const [sliderValues, setSliderValue] = useState<SliderValues[]>([]);
  const [showSliders, setShowSlider] = useState<ElementMap>({});
  const [showMetadatas, setShowMetadatas] = useState<ElementMap>({});
  const [showTrimButtons, setShowTrimButtons] = useState<ElementMap>({});
  const [trimTexts, setTrimTexts] = useState<ElementMap>({});

  const inputs = useRef<{ id: string; path: string }[]>([]);
  const gridRef = useRef<GridStack | null>(null);

  const addItem = () => {
    setItems([...items, { id: `${items.length + 1}` }]);
  };

  const resetItems = () => {
    inputs.current = [];
    setItems([]);
    setShowSlider({});
    setSliderValue([]);
    setShowMetadatas({});
    setShowTrimButtons({});
    setTrimTexts({});
  };

  const handleSliderChangeEnd = (id: string, value: [number, number]) => {
    setSliderValue((prevValues) =>
      prevValues.map((slider) =>
        slider.id === id ? { ...slider, values: value } : slider,
      ),
    );

    setTrimTexts((prev) => ({
      ...prev,
      [id]: <TrimmerText id={id} value={value}></TrimmerText>,
    }));
  };

  const handleTrimButton = (id: string, probed: Probed) => {
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

  const clearSlider = (id: string) => {
    setShowSlider((prev) => {
      if (!(id in prev)) return prev;
      const { [id]: removed, ...remainingItems } = prev;
      return remainingItems;
    });
  };

  const clearText = (id: string) => {
    setTrimTexts((prev) => {
      if (!(id in prev)) return prev;
      const { [id]: removed, ...remainingItems } = prev;
      return remainingItems;
    });
  };

  const clearSliderValue = (id: string) => {
    setSliderValue((prev) => prev.filter((slider) => slider.id !== id));
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

    // Clear sliders, values & text on new upload
    clearSlider(id);
    clearText(id);
    clearSliderValue(id);

    setShowMetadatas((prev) => ({
      ...prev,
      [id]: <Metadata probed={probed}></Metadata>,
    }));

    setShowTrimButtons((prev) => ({
      ...prev,
      [id]: (
        <TrimmerButton
          id={id}
          probed={probed}
          handleTrimButton={handleTrimButton}
        ></TrimmerButton>
      ),
    }));
  };

  const handleClearButton = (id: string) => {
    // Clear things from state first
    clearSlider(id);
    clearText(id);
    clearSliderValue(id);

    // Clear buttons
    setShowMetadatas((prev) => {
      if (!(id in prev)) return prev;
      const { [id]: removed, ...remainingItems } = prev;
      return remainingItems;
    });

    setShowTrimButtons((prev) => {
      if (!(id in prev)) return prev;
      const { [id]: removed, ...remainingItems } = prev;
      return remainingItems;
    });

    // Remove the item from grid
    setItems((items) => items.filter((item) => item.id !== id));
    // Remove it from registration
    inputs.current = inputs.current.filter((input) => input.id !== id);
  };

  return (
    <div>
      <Group justify="center">
        <AddButton addItem={addItem} />
        <ProcessButton
          gridRef={gridRef}
          inputs={inputs}
          sliderValues={sliderValues}
        />
        <ResetButton resetItems={resetItems} />
      </Group>
      <Stacker
        items={items}
        showSliders={showSliders}
        trimTexts={trimTexts}
        showMetadatas={showMetadatas}
        showTrimButtons={showTrimButtons}
        handleFileUpload={handleFileUpload}
        handleClearButton={handleClearButton}
        gridRef={gridRef}
      />
    </div>
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
