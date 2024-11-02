import { HoverCard, Text, Group, ActionIcon } from "@mantine/core";

import { IconInfoSquare } from "@tabler/icons-react";

const Metadata: React.FC<MetadataProps> = ({ probed }) => {
  return (
    <Group justify="center">
      <HoverCard shadow="md">
        <HoverCard.Target>
          <ActionIcon variant="transparent">
            <IconInfoSquare />
          </ActionIcon>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          {Object.entries(probed).map(([k, v]) => (
            <Text size="xs">
              {k.toLocaleUpperCase()}: {v}
            </Text>
          ))}
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
};

export default Metadata;
