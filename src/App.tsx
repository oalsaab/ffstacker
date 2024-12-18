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

function clearElement<T>(
  id: string,
  setElements: React.Dispatch<React.SetStateAction<{ [id: string]: T }>>,
) {
  setElements((prev) => {
    if (!(id in prev)) return prev;
    const { [id]: removed, ...remaining } = prev;
    return remaining;
  });
}

function StackManager(): React.JSX.Element {
  const [items, setItems] = useState<{ id: string }[]>([]);
  const [sliderValues, setSliderValue] = useState<SliderValues[]>([]);
  const [showSliders, setShowSlider] = useState<ElementMap>({});
  const [showMetadatas, setShowMetadatas] = useState<ElementMap>({});
  const [showTrimButtons, setShowTrimButtons] = useState<ElementMap>({});
  const [trimTexts, setTrimTexts] = useState<ElementMap>({});
  const [processResult, setProcessResult] = useState<ProcessResult | null>(
    null,
  );
  const [probes, setProbes] = useState<ProbeResults>({});

  const inputs = useRef<{ id: string; path: string }[]>([]);
  const gridRef = useRef<GridStack | null>(null);

  const addItem = () => {
    setItems([...items, { id: `${items.length + 1}` }]);
    // Reset the process button
    setProcessResult(null);
  };

  const resetItems = () => {
    inputs.current = [];
    setItems([]);
    setShowSlider({});
    setSliderValue([]);
    setShowMetadatas({});
    setShowTrimButtons({});
    setTrimTexts({});
    setProbes({});
    setProcessResult(null);
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

    const result: ProbeResult = await invoke("probe", { input: path });

    setProbes((prev) => ({
      ...prev,
      [id]: result,
    }));

    // Clear sliders, values & text on new upload
    clearElement(id, setShowSlider);
    clearElement(id, setTrimTexts);
    clearSliderValue(id);

    setShowMetadatas((prev) => ({
      ...prev,
      [id]: <Metadata probeResult={result}></Metadata>,
    }));

    if (result.status === "SUCCESS") {
      setShowTrimButtons((prev) => ({
        ...prev,
        [id]: (
          <TrimmerButton
            id={id}
            probed={result.probed}
            handleTrimButton={handleTrimButton}
          ></TrimmerButton>
        ),
      }));
    }
  };

  const handleClearButton = (id: string) => {
    // Clear things from state first
    clearElement(id, setShowSlider);
    clearElement(id, setTrimTexts);
    clearSliderValue(id);

    // Clear buttons
    clearElement(id, setShowMetadatas);
    clearElement(id, setShowTrimButtons);

    // Clear the probed value
    clearElement(id, setProbes);

    // Reset the process button
    setProcessResult(null);

    // Remove the item from grid
    setItems((items) => items.filter((item) => item.id !== id));
    // Remove it from registration
    inputs.current = inputs.current.filter((input) => input.id !== id);
  };

  const handleProcessResult = (result: ProcessResult) => {
    setProcessResult(result);
  };

  return (
    <div>
      <Group justify="center">
        <AddButton addItem={addItem} />
        <ProcessButton
          gridRef={gridRef}
          inputs={inputs}
          sliderValues={sliderValues}
          probes={probes}
          processResult={processResult}
          handleProcessResult={handleProcessResult}
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
}

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
