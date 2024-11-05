import { ActionIcon, RangeSlider, Text, Stack } from "@mantine/core";
import { IconScissors } from "@tabler/icons-react";
import { iconStyles, actionStyles } from "../styles";

export const TrimmerButton: React.FC<TrimmerButtonProps> = ({
  id,
  probed,
  handleTrimButton,
}) => {
  return (
    <ActionIcon {...actionStyles} onClick={() => handleTrimButton(id, probed)}>
      <IconScissors {...iconStyles} />
    </ActionIcon>
  );
};

export const Trimmer: React.FC<TrimmerProps> = ({
  id,
  probed,
  handleSliderChangeEnd,
}) => {
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
};

function trimFormat(value: number) {
  return new Date(value * 1000).toISOString().slice(11, 19);
}

export const TrimmerText: React.FC<TrimmerTextProps> = ({ value }) => {
  let [from, to] = value;
  let duration = to - from;

  return (
    <Stack align="flex-start" gap="xs">
      <Text size="sm">From: {trimFormat(from)}</Text>
      <Text size="sm">To: {trimFormat(to)}</Text>
      <Text size="sm">Duration: {trimFormat(duration)}</Text>
    </Stack>
  );
};
