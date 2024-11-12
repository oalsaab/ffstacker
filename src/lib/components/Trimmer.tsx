import { ActionIcon, RangeSlider, Stack, Text } from "@mantine/core";
import { IconScissors } from "@tabler/icons-react";
import { actionStyles, iconStyles } from "../styles";

export interface TrimmerButtonProps {
  id: string;
  probed: Probed;
  handleTrimButton: (id: string, probed: Probed) => void;
}

export interface TrimmerProps {
  id: string;
  probed: Probed;
  handleSliderChangeEnd: (id: string, value: [number, number]) => void;
}

export interface TrimmerTextProps {
  id: string;
  value: [number, number];
}

export function TrimmerButton({
  id,
  probed,
  handleTrimButton,
}: TrimmerButtonProps): React.JSX.Element {
  return (
    <ActionIcon {...actionStyles} onClick={() => handleTrimButton(id, probed)}>
      <IconScissors {...iconStyles} />
    </ActionIcon>
  );
}

export function Trimmer({
  id,
  probed,
  handleSliderChangeEnd,
}: TrimmerProps): React.JSX.Element {
  return (
    <RangeSlider
      key={probed.filename}
      color="pink"
      mt={"xl"}
      pos={"relative"}
      minRange={10}
      min={0}
      max={probed.duration}
      step={5}
      label={null}
      onChangeEnd={(value) => handleSliderChangeEnd(id, value)}
    />
  );
}

function trimFormat(value: number) {
  return new Date(value * 1000).toISOString().slice(11, 19);
}

export function TrimmerText({ value }: TrimmerTextProps): React.JSX.Element {
  let [from, to] = value;
  let duration = to - from;

  return (
    <Stack align="flex-start" gap="xs">
      <Text size="sm">From: {trimFormat(from)}</Text>
      <Text size="sm">To: {trimFormat(to)}</Text>
      <Text size="sm">Duration: {trimFormat(duration)}</Text>
    </Stack>
  );
}
