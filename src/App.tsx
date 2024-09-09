import {
  useState,
  useEffect,
  useRef,
  createRef,
  MutableRefObject,
  RefObject,
  MouseEvent,
} from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";

import {
  RangeSlider,
  HoverCard,
  Button,
  Stack,
  Text,
  Group,
  ActionIcon,
} from "@mantine/core";

import "./App.css";
import "gridstack/dist/gridstack.min.css";
import "gridstack/dist/gridstack-extra.min.css";
import "@mantine/core/styles.css";
import { GridStack } from "gridstack";
import {
  IconUpload,
  IconInfoCircle,
  IconArrowsMove,
  IconCirclePlus,
  IconReload,
} from "@tabler/icons-react";

// Define the Item component that accepts id as a prop

interface ItemProps {
  id: string;
  showSlider: JSX.Element;
  handleFileUpload: (id: string, file: string | string[]) => void;
}

const Item: React.FC<ItemProps> = ({ id, handleFileUpload, showSlider }) => {
  async function handler(_: MouseEvent<HTMLButtonElement>) {
    const selected = await open({ multiple: false });

    if (selected) {
      handleFileUpload(id, selected);
    }
  }

  return (
    <div className="grid-content">
      <Stack justify="center" gap="md">
        <ActionIcon variant="outline" color="red">
          <IconArrowsMove
            style={{ width: "70%", height: "70%" }}
            stroke={1.5}
            className="drag-header"
          ></IconArrowsMove>
        </ActionIcon>
        <Group justify="center">
          <ActionIcon variant="outline" color="pink" onClick={handler}>
            <IconUpload style={{ width: "70%", height: "70%" }} stroke={1.5} />
          </ActionIcon>
        </Group>
        <div className="slider">{showSlider}</div>
      </Stack>
    </div>
  );
};

// ControlledStack props interface
interface ControlledStackProps {
  items: Array<{ id: string }>;
  inputs: MutableRefObject<{ id: string; path: string }[]>;
  showSliders: { [key: string]: JSX.Element };
  sliderValues: SliderValues[];
  addItem: () => void;
  resetItems: () => void;
  handleFileUpload: (id: string, file: string | string[]) => void;
}

// ControlledStack component
const ControlledStack: React.FC<ControlledStackProps> = ({
  items,
  inputs,
  showSliders,
  sliderValues,
  handleFileUpload,
  addItem,
  resetItems,
}) => {
  const refs = useRef<{ [key: string]: RefObject<HTMLDivElement> }>({});
  const gridRef = useRef<GridStack | null>(null);

  // Ensure refs for items are created if they don't exist
  if (Object.keys(refs.current).length !== items.length) {
    items.forEach(({ id }) => {
      refs.current[id] = refs.current[id] || createRef<HTMLDivElement>();
    });
  }

  // UseEffect for initializing GridStack and updating widgets
  useEffect(() => {
    // Initialize GridStack only once
    gridRef.current =
      gridRef.current ||
      GridStack.init(
        {
          float: false,
          disableResize: true,
          column: 4,
          handle: ".drag-header",
        },
        ".controlled"
      );

    const grid = gridRef.current;
    grid.compact("compact");

    grid.batchUpdate();
    grid.removeAll(false); // Clear existing widgets

    items.forEach(({ id }) => {
      if (refs.current[id]?.current) {
        grid.makeWidget(refs.current[id].current!, { id: id }); // Add new widgets
      }
    });

    grid.batchUpdate(false);
  }, [items]);

  const processStack = async () => {
    const layout = gridRef.current?.save();

    if (layout) {
      console.log(layout);

      let r = await invoke("process_stack", {
        stack: layout,
        inputs: inputs.current,
        sliders: sliderValues,
      });

      console.log(r);

      console.log("The mapping:");

      console.log(inputs.current);
    }
  };

  return (
    <div className="controlled-container">
      <Group justify="center">
        <Button
          variant="outline"
          color="cyan"
          rightSection={<IconCirclePlus />}
          onClick={addItem}
        >
          Add
        </Button>
        <Button variant="outline" color="cyan" onClick={processStack}>
          Process
        </Button>
        <Button
          variant="outline"
          color="cyan"
          rightSection={<IconReload />}
          onClick={resetItems}
        >
          Reset
        </Button>
      </Group>
      <div className="grid-container grid-stack controlled">
        {items.map((item) => (
          <div
            ref={refs.current[item.id]}
            key={item.id}
            className="grid-stack-item"
            data-id={item.id}
          >
            <div className="grid-stack-item-content">
              <Item
                id={item.id}
                handleFileUpload={handleFileUpload}
                showSlider={showSliders[item.id]}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SliderValues {
  id: string;
  values: [number, number];
}

interface Probed {
  filename: string;
  dimensions: string;
  duration: number;
}

function valueLabelFormat(value: number) {
  return new Date(value * 1000).toISOString().slice(11, 19);
}

// ControlledExample component
const ControlledExample: React.FC = () => {
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
    <ControlledStack
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
      <h1>Stacker</h1>
      <ControlledExample />
    </div>
  );
};

export default App;
