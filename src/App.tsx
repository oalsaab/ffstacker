import {
  useState,
  useEffect,
  useRef,
  createRef,
  MutableRefObject,
} from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";

import {
  MantineProvider,
  RangeSlider,
  HoverCard,
  Button,
  Text,
  Group,
} from "@mantine/core";

import "./App.css";
import "gridstack/dist/gridstack.min.css";
import "gridstack/dist/gridstack-extra.min.css";
import "@mantine/core/styles.css";
import { GridStack } from "gridstack";

// Define the Item component that accepts id as a prop

interface ItemProps {
  id: string;
  showSlider: JSX.Element;
  handleFileUpload: (id: string, file: string | string[]) => void;
}

const Item: React.FC<ItemProps> = ({ id, handleFileUpload, showSlider }) => {
  async function handler(_: React.MouseEvent<HTMLButtonElement>) {
    const selected = await open({ multiple: false });

    if (selected) {
      handleFileUpload(id, selected);
    }
  }

  return (
    <div className="grid-content">
      <div className="drag-header">Drag</div>
      <div className="item-button">
        <button className="upload-button" onClick={handler}>
          {id}
        </button>
      </div>
      <MantineProvider>
        <div className="slider">{showSlider}</div>
      </MantineProvider>
    </div>
  );
};

// ControlledStack props interface
interface ControlledStackProps {
  items: Array<{ id: string }>;
  mapping: MutableRefObject<{ id: string; filename: string }[]>;
  showSliders: { [key: string]: JSX.Element };
  addItem: () => void;
  resetItems: () => void;
  handleFileUpload: (id: string, file: string | string[]) => void;
}

// ControlledStack component
const ControlledStack: React.FC<ControlledStackProps> = ({
  items,
  mapping,
  showSliders,
  handleFileUpload,
  addItem,
  resetItems,
}) => {
  const refs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});
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
      //   Pass in mapping
      let r = await invoke("process_stack", { stack: layout });
      console.log(r);
      console.log("The mapping:");
      console.log(mapping.current);
    }
  };

  return (
    <div className="controlled-container">
      <div className="top-button-container">
        <button onClick={addItem}>Add</button>
        <button onClick={resetItems}>Reset</button>
        <button onClick={processStack}>Process</button>
      </div>
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

  const mapping = useRef<{ id: string; filename: string }[]>([]);

  const addItem = () => {
    setItems([...items, { id: `${items.length + 1}` }]);
  };

  const resetItems = () => {
    mapping.current = [];
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

    const filename = file;
    const entry = mapping.current.find((map) => map.id === id);

    if (entry) {
      entry.filename = filename;
    } else {
      mapping.current.push({ id, filename });
    }

    let probed: Probed = await invoke("probe", { filename: filename });

    if (!sliderValues.some((slider) => slider.id === id)) {
      setSliderValue((prev) => [...prev, { id, values: [0, probed.duration] }]);
    }

    setShowSlider((prev) => ({
      ...prev,
      [id]: (
        <div>
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
                <Button size="compact-xs" color="pink">
                  I
                </Button>
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Text size="xs" ta="center">
                  File: {probed.filename} <br />
                  Dimensions: {probed.dimensions}
                </Text>
              </HoverCard.Dropdown>
            </HoverCard>
          </Group>
        </div>
      ),
    }));
  };

  return (
    <ControlledStack
      items={items}
      addItem={addItem}
      resetItems={resetItems}
      showSliders={showSliders}
      mapping={mapping}
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
