import { RangeSlider } from "@mantine/core";

const Trimmer: React.FC<TrimmerProps> = ({
  id,
  probed,
  handleSliderChangeEnd,
}) => {
  return (
    <RangeSlider
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

export default Trimmer;
