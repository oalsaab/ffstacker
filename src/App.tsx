import { useState, useEffect, useRef, createRef } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

import "gridstack/dist/gridstack.min.css";
import "gridstack/dist/gridstack-extra.min.css";
import { GridStack } from "gridstack";

// Define the Item component that accepts id as a prop
interface ItemProps {
  id: string;
}
const Item: React.FC<ItemProps> = ({ id }) => <div>{id}</div>;

// ControlledStack props interface
interface ControlledStackProps {
  items: Array<{ id: string }>;
  addItem: () => void;
  resetItems: () => void;
}

// ControlledStack component
const ControlledStack: React.FC<ControlledStackProps> = ({
  items,
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
      let r = await invoke("process_stack", { stack: layout });
      console.log(r);
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
              <Item {...item} />
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

  const addItem = () => {
    setItems([...items, { id: `${items.length + 1}` }]);
  };

  const resetItems = () => {
    setItems(initialItems);
  };

  return (
    <ControlledStack items={items} addItem={addItem} resetItems={resetItems} />
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
