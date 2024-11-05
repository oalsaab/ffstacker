import { useState, useRef } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Center } from "@mantine/core";
import "./App.css";
import "gridstack/dist/gridstack.min.css";
import "gridstack/dist/gridstack-extra.min.css";
import "@mantine/core/styles.css";

import Stacker from "./lib/components/Stacker";
import { Trimmer, TrimmerButton, TrimmerText } from "./lib/components/Trimmer";
import Metadata from "./lib/components/Metadata";

const StackManager: React.FC = () => {
  const initialItems = [{ id: "1" }, { id: "2" }];
  const [items, setItems] = useState(initialItems);
  const [sliderValues, setSliderValue] = useState<SliderValues[]>([]);
  const [showSliders, setShowSlider] = useState<ElementMap>({});
  const [showMetadatas, setShowMetadatas] = useState<ElementMap>({});
  const [showTrimButtons, setShowTrimButtons] = useState<ElementMap>({});
  const [trimTexts, setTrimTexts] = useState<ElementMap>({});

  const inputs = useRef<{ id: string; path: string }[]>([]);

  const addItem = () => {
    setItems([...items, { id: `${items.length + 1}` }]);
  };

  const resetItems = () => {
    inputs.current = [];
    setItems(initialItems);
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

    // Clear out sliders on new upload
    setShowSlider((prev) => {
      if (!(id in prev)) return prev;
      const { [id]: _, ...updated } = prev;
      return updated;
    });

    // Clear out trim text on new upload
    setTrimTexts((prev) => {
      if (!(id in prev)) return prev;
      const { [id]: _, ...updated } = prev;
      return updated;
    });

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

  return (
    <Stacker
      items={items}
      addItem={addItem}
      resetItems={resetItems}
      showSliders={showSliders}
      sliderValues={sliderValues}
      trimTexts={trimTexts}
      showMetadatas={showMetadatas}
      showTrimButtons={showTrimButtons}
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
