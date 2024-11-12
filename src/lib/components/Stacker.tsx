import { GridStack } from "gridstack";
import { createRef, RefObject, useEffect, useRef } from "react";
import Item from "./Item";

export interface StackerProps {
  items: Array<{ id: string }>;
  showSliders: ElementMap;
  showMetadatas: ElementMap;
  showTrimButtons: ElementMap;
  trimTexts: ElementMap;
  handleFileUpload: (id: string, file: string | string[]) => void;
  handleClearButton: (id: string) => void;
  gridRef: React.MutableRefObject<GridStack | null>;
}

export default function Stacker({
  items,
  showSliders,
  trimTexts,
  showMetadatas,
  showTrimButtons,
  handleFileUpload,
  handleClearButton,
  gridRef,
}: StackerProps): React.JSX.Element {
  const refs = useRef<{ [key: string]: RefObject<HTMLDivElement> }>({});

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

  return (
    <div className="controlled-container">
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
                handleClearButton={handleClearButton}
                showSlider={showSliders[item.id]}
                showMetadata={showMetadatas[item.id]}
                showTrimButton={showTrimButtons[item.id]}
                trimText={trimTexts[item.id]}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
