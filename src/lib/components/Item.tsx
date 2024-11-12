import { ActionIcon, Group, Stack, Tooltip } from "@mantine/core";
import { IconArrowsMove, IconUpload, IconX } from "@tabler/icons-react";
import { open } from "@tauri-apps/api/dialog";
import { MouseEvent } from "react";
import { actionStyles, iconStyles } from "../styles";
import { videoExtensions } from "./constants";

export interface ItemProps {
  id: string;
  showSlider: React.JSX.Element;
  trimText: React.JSX.Element;
  showMetadata: React.JSX.Element;
  showTrimButton: React.JSX.Element;
  handleFileUpload: (id: string, file: string | string[]) => void;
  handleClearButton: (id: string) => void;
}

export default function Item({
  id,
  handleFileUpload,
  handleClearButton,
  showSlider,
  trimText,
  showMetadata,
  showTrimButton,
}: ItemProps): React.JSX.Element {
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
}
