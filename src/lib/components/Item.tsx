import { open } from "@tauri-apps/api/dialog";
import { MouseEvent } from "react";
import { Stack, Group, ActionIcon, Tooltip } from "@mantine/core";
import { IconUpload, IconArrowsMove } from "@tabler/icons-react";
import { videoExtensions } from "./constants";

const Item: React.FC<ItemProps> = ({
  id,
  handleFileUpload,
  showSlider,
  showMetadata,
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
        </Group>
        <div className="slider">{showSlider}</div>
      </Stack>
    </div>
  );
};

export default Item;
