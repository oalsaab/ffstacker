import { ActionIcon, Group, Stack } from "@mantine/core";
import { IconArrowsMove, IconTrashX, IconUpload } from "@tabler/icons-react";
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
          <ActionIcon {...actionStyles} onClick={handler}>
            <IconUpload {...iconStyles} />
          </ActionIcon>
          <ActionIcon {...actionStyles} onClick={() => handleClearButton(id)}>
            <IconTrashX {...iconStyles} />
          </ActionIcon>
        </Group>
        {showSlider}
        {trimText}
      </Stack>
    </div>
  );
}
