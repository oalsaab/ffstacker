import { RangeSlider } from "@mantine/core";

function valueLabelFormat(value: number) {
  return new Date(value * 1000).toISOString().slice(11, 19);
}

const Trimmer: React.FC<TrimmerProps> = ({
  id,
  probed,
  handleSliderChangeEnd,
}) => {
  return (
    <RangeSlider
      color="red"
      mt={"xl"}
      pos={"relative"}
      minRange={10}
      min={0}
      max={probed.duration}
      step={5}
      label={valueLabelFormat}
      onChangeEnd={(value) => handleSliderChangeEnd(id, value)}
    />
  );
};

export default Trimmer;
