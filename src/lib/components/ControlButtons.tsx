import { Button, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCheck,
  IconPlayerPlay,
  IconPlus,
  IconReload,
  IconX,
} from "@tabler/icons-react";
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
  processResult: ProcessResult | null;
  handleProcessResult: (result: ProcessResult) => void;
}

export function AddButton({ addItem }: AddButtonProp): React.JSX.Element {
  return (
    <Button {...actionStyles} rightSection={<IconPlus />} onClick={addItem}>
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

function statusDisplay(result: ProcessResult | null) {
  if (!result) {
    return {
      label: "Process the stack",
      color: "cyan",
      icon: <IconPlayerPlay />,
    };
  }

  const label = result.message;

  switch (result.status) {
    case "SUCCESS":
      return { label: label, color: "green", icon: <IconCheck /> };
    case "FAILED":
      return { label: label, color: "red", icon: <IconX /> };
  }
}

export function ProcessButton({
  gridRef,
  inputs,
  sliderValues,
  processResult,
  handleProcessResult,
}: ProcessButtonProp): React.JSX.Element {
  // For whatever reason this must be declared before any if conditions
  const [loading, { open, close }] = useDisclosure();

  const processStack = async (): Promise<ProcessResult> => {
    const layout = gridRef.current?.save();

    const selected = await TauriOpen({
      multiple: false,
      directory: true,
    });

    if (Array.isArray(selected)) {
      return { status: "FAILED", message: "Multiple outputs selected" };
    }

    if (!(selected && layout)) {
      return {
        status: "FAILED",
        message: "No layout found and/or no output selected",
      };
    }

    let result: ProcessResult = await TauriInvoke("process", {
      positions: layout,
      sources: inputs.current,
      sliders: sliderValues,
      output: selected,
    });

    return result;
  };

  if (inputs.current.length < 2) {
    return (
      <Tooltip
        label="A minimum of 2 inputs is required for processing!"
        transitionProps={{ transition: "fade-up", duration: 300 }}
        color="gray"
      >
        <Button
          {...actionStyles}
          data-disabled
          onClick={(event) => event.preventDefault()}
          rightSection={<IconPlayerPlay />}
        >
          Process
        </Button>
      </Tooltip>
    );
  }

  const handleProcessStack = async () => {
    open(); // Start loading
    const result = await processStack();
    handleProcessResult(result);
    close(); // Stop loading after completion
  };

  const { label, color, icon } = statusDisplay(processResult);

  return (
    <Tooltip
      label={label}
      transitionProps={{ transition: "fade-up", duration: 300 }}
      color="gray"
    >
      <Button
        loading={loading}
        loaderProps={{ type: "dots" }}
        variant="outline"
        color={color}
        rightSection={icon}
        onClick={handleProcessStack}
      >
        Process
      </Button>
    </Tooltip>
  );
}
