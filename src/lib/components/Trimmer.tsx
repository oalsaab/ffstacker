import { ActionIcon, RangeSlider } from "@mantine/core";
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
