import { ActionIcon, RangeSlider } from "@mantine/core";
import { IconScissors } from "@tabler/icons-react";

export const TrimmerButton: React.FC<TrimmerButtonProps> = ({
  id,
  probed,
  handleTrimButton,
}) => {
  return (
    <ActionIcon
      variant="outline"
      color="cyan"
      onClick={() => handleTrimButton(id, probed)}
    >
      <IconScissors style={{ width: "70%", height: "70%" }} stroke={1.5} />
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
