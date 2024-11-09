import { ActionIcon, Group, HoverCard, Text } from "@mantine/core";
import { IconFileInfo } from "@tabler/icons-react";
import { actionStyles, iconStyles } from "../styles";

const Metadata: React.FC<MetadataProps> = ({ probed }) => {
  return (
    <Group justify="center">
      <HoverCard shadow="md">
        <HoverCard.Target>
          <ActionIcon {...actionStyles}>
            <IconFileInfo {...iconStyles} />
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
