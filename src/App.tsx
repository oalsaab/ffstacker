import {
  useState,
  useEffect,
  useRef,
  createRef,
  MutableRefObject,
} from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import "./App.css";

import "gridstack/dist/gridstack.min.css";
import "gridstack/dist/gridstack-extra.min.css";
import { GridStack } from "gridstack";

// Define the Item component that accepts id as a prop

interface ItemProps {
  id: string;
  showSlider: boolean;
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
      <button className="upload-button" onClick={handler}>
        {id}
      </button>
      {showSlider && <div>Slider</div>}
    </div>
  );
};

// ControlledStack props interface
interface ControlledStackProps {
  items: Array<{ id: string }>;
  mapping: MutableRefObject<{ id: string; filename: string }[]>;
  showSliders: { [key: string]: boolean };
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
        { float: false, disableResize: true, column: 6 },
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

// ControlledExample component
const ControlledExample: React.FC = () => {
  const initialItems = [{ id: "1" }, { id: "2" }];
  const [items, setItems] = useState(initialItems);
  const [showSliders, setShowSlider] = useState<{ [key: string]: boolean }>({});

  const mapping = useRef<{ id: string; filename: string }[]>([]);

  const addItem = () => {
    setItems([...items, { id: `${items.length + 1}` }]);
  };

  const resetItems = () => {
    mapping.current = [];
    setItems(initialItems);
    setShowSlider({});
  };

  const handleFileUpload = (id: string, file: string | string[]) => {
    if (Array.isArray(file)) {
      return;
    }

    setShowSlider((prev) => ({ ...prev, [id]: true }));

    // Mapping can also include ranges for each upload?

    const filename = file;
    const entry = mapping.current.find((map) => map.id === id);

    if (entry) {
      entry.filename = filename; // Update mapping instead of appending duplicates
    } else {
      mapping.current.push({ id, filename });
    }

    console.log(`File uploaded for item ${id}:`, file);
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
