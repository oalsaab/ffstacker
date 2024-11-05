import { open } from "@tauri-apps/api/dialog";
import { MouseEvent } from "react";
import { Stack, Group, ActionIcon, Tooltip, Text } from "@mantine/core";
import { IconUpload, IconArrowsMove } from "@tabler/icons-react";
import { videoExtensions } from "./constants";

function trimFormat(value: number) {
  return new Date(value * 1000).toISOString().slice(11, 19);
}

function trim(slider: SliderValues | null): React.JSX.Element {
  if (!slider) {
    return <></>;
  }

  let [from, to] = slider.values;
  let duration = to - from;

  return (
    <Stack justify="center" align="flex-start" gap="xs">
      <Text size="sm">From: {trimFormat(from)}</Text>
      <Text size="sm">To: {trimFormat(to)}</Text>
      <Text size="sm">Duration: {trimFormat(duration)}</Text>
    </Stack>
  );
}

const Item: React.FC<ItemProps> = ({
  id,
  handleFileUpload,
  showSlider,
  sliderValue,
  showMetadata,
  showTrimButton,
}) => {
  async function handler(_: MouseEvent<HTMLButtonElement>) {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Video", extensions: videoExtensions }],
    });

    if (selected) {
      handleFileUpload(id, selected);
    }
  }

  return (
    <div className="grid-content">
      <Stack justify="center" gap="md">
        <Group justify="space-between">
          <ActionIcon variant="default">
            <IconArrowsMove
              style={{ width: "70%", height: "70%" }}
              stroke={1.5}
              className="drag-header"
            ></IconArrowsMove>
          </ActionIcon>
          <div className="metadata">{showMetadata}</div>
        </Group>
        <Group justify="center">
          <Tooltip label="Click to select a video file to stack">
            <ActionIcon variant="outline" color="cyan" onClick={handler}>
              <IconUpload
                style={{ width: "70%", height: "70%" }}
                stroke={1.5}
              />
            </ActionIcon>
          </Tooltip>
          {showTrimButton}
        </Group>
        <div className="slider">{showSlider}</div>
        {trim(sliderValue)}
      </Stack>
    </div>
  );
};

export default Item;
