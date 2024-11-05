import { useEffect, useRef, createRef, RefObject } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { Button, Group, Tooltip } from "@mantine/core";
import { GridStack } from "gridstack";
import { IconCirclePlus, IconReload } from "@tabler/icons-react";
import Item from "./Item";
import { actionStyles } from "../styles";

const Stacker: React.FC<StackerProps> = ({
  items,
  inputs,
  showSliders,
  sliderValues,
  showMetadatas,
  showTrimButtons,
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
        ".controlled",
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

    const selected = await open({
      multiple: false,
      directory: true,
    });

    if (Array.isArray(selected)) {
      return;
    }

    if (selected && layout) {
      let result = await invoke("process", {
        positions: layout,
        sources: inputs.current,
        sliders: sliderValues,
        output: selected,
      });
    }
  };

  const processButton = () => {
    if (inputs.current.length < 2) {
      return (
        <Tooltip label="A minimum of 2 inputs is required for processing!">
          <Button
            {...actionStyles}
            data-disabled
            onClick={(event) => event.preventDefault()}
          >
            Process
          </Button>
        </Tooltip>
      );
    }

    return (
      <Button {...actionStyles} onClick={processStack}>
        Process
      </Button>
    );
  };

  return (
    <div className="controlled-container">
      <Group justify="center">
        <Button
          {...actionStyles}
          rightSection={<IconCirclePlus />}
          onClick={addItem}
        >
          Add
        </Button>
        <div>{processButton()}</div>
        <Button
          {...actionStyles}
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
                showMetadata={showMetadatas[item.id]}
                showTrimButton={showTrimButtons[item.id]}
                sliderValue={
                  sliderValues.find((obj) => obj.id === item.id) || null
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stacker;
