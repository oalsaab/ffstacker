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

function valueLabelFormat(value: number) {
  return new Date(value * 1000).toISOString().slice(11, 19);
}

const StackManager: React.FC = () => {
  const initialItems = [{ id: "1" }, { id: "2" }];
  const [items, setItems] = useState(initialItems);
  const [sliderValues, setSliderValue] = useState<SliderValues[]>([]);
  const [showSliders, setShowSlider] = useState<{ [key: string]: JSX.Element }>(
    {}
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
        slider.id === id ? { ...slider, values: value } : slider
      )
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

    if (!sliderValues.some((slider) => slider.id === id)) {
      setSliderValue((prev) => [...prev, { id, values: [0, probed.duration] }]);
    }

    setShowSlider((prev) => ({
      ...prev,
      [id]: (
        <Stack>
          <RangeSlider
            color="red"
            mt={"xl"}
            pos={"relative"}
            minRange={10}
            min={0}
            max={probed.duration}
            step={5}
            label={valueLabelFormat}
            onChangeEnd={(value) => handleSliderChangeEnd(id, value)}
          />
          <Group justify="center">
            <HoverCard width={200} shadow="md">
              <HoverCard.Target>
                <ActionIcon
                  variant="transparent"
                  size="compact-xs"
                  color="pink"
                >
                  <IconInfoCircle />
                </ActionIcon>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Text size="xs" ta="center">
                  File: {probed.filename} <br />
                  Dimensions: {probed.dimensions}
                </Text>
              </HoverCard.Dropdown>
            </HoverCard>
          </Group>
        </Stack>
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
