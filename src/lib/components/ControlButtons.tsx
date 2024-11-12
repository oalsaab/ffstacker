import { Button, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCirclePlus, IconReload } from "@tabler/icons-react";
import { open as TauriOpen } from "@tauri-apps/api/dialog";
import { invoke as TauriInvoke } from "@tauri-apps/api/tauri";
import { GridStack } from "gridstack";
import { actionStyles } from "../styles";

export interface AddButtonProp {
  addItem: () => void;
}

export interface ResetButtonProp {
  resetItems: () => void;
}

export interface ProcessButtonProp {
  gridRef: React.MutableRefObject<GridStack | null>;
  inputs: React.MutableRefObject<{ id: string; path: string }[]>;
  sliderValues: SliderValues[];
}

export function AddButton({ addItem }: AddButtonProp): React.JSX.Element {
  return (
    <Button
      {...actionStyles}
      rightSection={<IconCirclePlus />}
      onClick={addItem}
    >
      Add
    </Button>
  );
}

export function ResetButton({
  resetItems,
}: ResetButtonProp): React.JSX.Element {
  return (
    <Button
      {...actionStyles}
      rightSection={<IconReload />}
      onClick={resetItems}
    >
      Reset
    </Button>
  );
}

export function ProcessButton({
  gridRef,
  inputs,
  sliderValues,
}: ProcessButtonProp): React.JSX.Element {
  // For whatever reason this must be declared before any if conditions
  const [loading, { open, close }] = useDisclosure();

  const processStack = async () => {
    const layout = gridRef.current?.save();

    const selected = await TauriOpen({
      multiple: false,
      directory: true,
    });

    if (Array.isArray(selected)) {
      return;
    }

    if (selected && layout) {
      let result = await TauriInvoke("process", {
        positions: layout,
        sources: inputs.current,
        sliders: sliderValues,
        output: selected,
      });
    }
  };

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

  const handleProcessStack = async () => {
    open(); // Start loading
    const _ = await processStack();
    close(); // Stop loading after completion
  };

  return (
    <Button
      loading={loading}
      loaderProps={{ type: "dots" }}
      {...actionStyles}
      onClick={handleProcessStack}
    >
      Process
    </Button>
  );
}
