import { ActionIcon, Group, HoverCard, Text } from "@mantine/core";
import { IconFileInfo, IconFileSad } from "@tabler/icons-react";
import { actionStyles, iconStyles } from "../styles";

interface MetadataProps {
  probeResult: ProbeResult;
}

function ProbeSuccess({ probeResult }: MetadataProps): React.JSX.Element {
  return (
    <HoverCard shadow="md">
      <HoverCard.Target>
        <ActionIcon {...actionStyles}>
          <IconFileInfo {...iconStyles} />
        </ActionIcon>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        {Object.entries(probeResult.probed).map(([k, v]) => (
          <Text size="xs">
            {k.toLocaleUpperCase()}: {v}
          </Text>
        ))}
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

function ProbeFailed({ probeResult }: MetadataProps): React.JSX.Element {
  return (
    <HoverCard shadow="md">
      <HoverCard.Target>
        <ActionIcon variant="outline" color="pink">
          <IconFileSad {...iconStyles} />
        </ActionIcon>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text c="red" tt="uppercase" size="md">
          Probing failed!
        </Text>
        <Text size="xs">{probeResult.message}</Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
}

export default function Metadata({
  probeResult,
}: MetadataProps): React.JSX.Element {
  let info = <></>;
  switch (probeResult.status) {
    case "SUCCESS":
      info = <ProbeSuccess probeResult={probeResult} />;
      break;
    case "FAILED":
      info = <ProbeFailed probeResult={probeResult} />;
      break;
  }

  return <Group justify="center">{info}</Group>;
}
