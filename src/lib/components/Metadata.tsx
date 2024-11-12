import { ActionIcon, Group, HoverCard, Text } from "@mantine/core";
import { IconFileInfo } from "@tabler/icons-react";
import { actionStyles, iconStyles } from "../styles";

interface MetadataProps {
  probed: Probed;
}

export default function Metadata({ probed }: MetadataProps): React.JSX.Element {
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
}
