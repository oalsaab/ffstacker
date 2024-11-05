import { open } from "@tauri-apps/api/dialog";
import { MouseEvent } from "react";
import { Stack, Group, ActionIcon, Tooltip, Text } from "@mantine/core";
import { IconUpload, IconArrowsMove } from "@tabler/icons-react";
import { videoExtensions } from "./constants";
import { iconStyles, actionStyles } from "../styles";

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
          <ActionIcon {...actionStyles}>
            <IconArrowsMove
              {...iconStyles}
              // Class header required exactly as is for gridstack to work
              className="drag-header"
            ></IconArrowsMove>
          </ActionIcon>
          {showTrimButton}
          {showMetadata}
          <Tooltip label="Click to select a video file to stack">
            <ActionIcon {...actionStyles} onClick={handler}>
              <IconUpload {...iconStyles} />
            </ActionIcon>
          </Tooltip>
        </Group>
        {showSlider}
        {trim(sliderValue)}
      </Stack>
    </div>
  );
};

export default Item;
