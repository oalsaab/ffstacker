import { useEffect, useRef, createRef, RefObject } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Button, Group } from "@mantine/core";
import { GridStack } from "gridstack";
import { IconCirclePlus, IconReload } from "@tabler/icons-react";
import Item from "./Item";

const Stacker: React.FC<StackerProps> = ({
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
          removable: true,
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
      let result = await invoke("process_stack", {
        stack: layout,
        inputs: inputs.current,
        sliders: sliderValues,
      });
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

export default Stacker;
