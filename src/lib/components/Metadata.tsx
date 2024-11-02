import { HoverCard, Text, Group, ActionIcon } from "@mantine/core";

import { IconInfoCircle } from "@tabler/icons-react";

const Metadata: React.FC<MetadataProps> = ({ probed }) => {
  return (
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
  );
};

export default Metadata;
