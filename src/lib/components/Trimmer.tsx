import {
  RangeSlider,
  HoverCard,
  Stack,
  Text,
  Group,
  ActionIcon,
} from "@mantine/core";

import { IconInfoCircle } from "@tabler/icons-react";

function valueLabelFormat(value: number) {
  return new Date(value * 1000).toISOString().slice(11, 19);
}

const Trimmer: React.FC<TrimmerProps> = ({
  id,
  probed,
  handleSliderChangeEnd,
}) => {
  return (
    <Stack>
      <RangeSlider
        color="red"
        mt={"xl"}
        pos={"relative"}
        minRange={10}
        min={0}
        max={probed.duration}
        step={5}
        label={valueLabelFormat}
        onChangeEnd={(value) => handleSliderChangeEnd(id, value)}
      />
      <Group justify="center">
        <HoverCard width={200} shadow="md">
          <HoverCard.Target>
            <ActionIcon variant="transparent" size="compact-xs" color="pink">
              <IconInfoCircle />
            </ActionIcon>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text size="xs" ta="center">
              {/* TODO: Create these through a map func */}
              File: {probed.filename} <br />
              Width: {probed.width} <br />
              Height: {probed.height}
            </Text>
          </HoverCard.Dropdown>
        </HoverCard>
      </Group>
    </Stack>
  );
};

export default Trimmer;
