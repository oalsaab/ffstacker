import { open } from "@tauri-apps/api/dialog";
import { MouseEvent } from "react";
import { Stack, Group, ActionIcon } from "@mantine/core";
import { IconUpload, IconArrowsMove, IconSquareX } from "@tabler/icons-react";

interface ItemProps {
  id: string;
  showSlider: JSX.Element;
  handleFileUpload: (id: string, file: string | string[]) => void;
}

const Item: React.FC<ItemProps> = ({ id, handleFileUpload, showSlider }) => {
  async function handler(_: MouseEvent<HTMLButtonElement>) {
    const selected = await open({ multiple: false });

    if (selected) {
      handleFileUpload(id, selected);
    }
  }

  return (
    <div className="grid-content">
      <Stack justify="center" gap="md">
        <Group justify="space-between">
          <ActionIcon variant="outline" color="pink">
            <IconArrowsMove
              style={{ width: "70%", height: "70%" }}
              stroke={1.5}
              className="drag-header"
            ></IconArrowsMove>
          </ActionIcon>
          <ActionIcon variant="transparent" color="red">
            <IconSquareX stroke={1.5}></IconSquareX>
          </ActionIcon>
        </Group>
        <Group justify="center">
          <ActionIcon variant="outline" color="pink" onClick={handler}>
            <IconUpload style={{ width: "70%", height: "70%" }} stroke={1.5} />
          </ActionIcon>
        </Group>
        <div className="slider">{showSlider}</div>
      </Stack>
    </div>
  );
};

export default Item;
