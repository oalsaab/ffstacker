import { open } from "@tauri-apps/api/dialog";
import { MouseEvent } from "react";
import { Stack, Group, ActionIcon, Tooltip } from "@mantine/core";
import { IconUpload, IconArrowsMove, IconX } from "@tabler/icons-react";
import { videoExtensions } from "./constants";
import { iconStyles, actionStyles } from "../styles";

const Item: React.FC<ItemProps> = ({
  id,
  handleFileUpload,
  handleClearButton,
  showSlider,
  trimText,
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
        <Group justify="space-between" gap="xs">
          <ActionIcon {...actionStyles}>
            <IconArrowsMove
              {...iconStyles}
              // Classname required exactly as is for gridstack to work
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
          <ActionIcon
            variant="outline"
            color="pink"
            onClick={() => handleClearButton(id)}
          >
            <IconX {...iconStyles} />
          </ActionIcon>
        </Group>
        {showSlider}
        {trimText}
      </Stack>
    </div>
  );
};

export default Item;
