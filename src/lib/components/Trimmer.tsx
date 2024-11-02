import { RangeSlider, Box, Text } from "@mantine/core";

function valueLabelFormat(value: number) {
  return new Date(value * 1000).toISOString().slice(11, 19);
}

const Trimmer: React.FC<TrimmerProps> = ({
  id,
  probed,
  handleSliderChangeEnd,
}) => {
  let from = 0;
  let to = 0;

  const endHandle = (value: [number, number]) => {
    handleSliderChangeEnd(id, value);

    [from, to] = value;
  };

  return (
    <Box>
      <RangeSlider
        color="pink"
        mt={"xl"}
        pos={"relative"}
        minRange={10}
        min={0}
        max={probed.duration}
        step={5}
        label={valueLabelFormat}
        onChangeEnd={(value) => endHandle(value)}
      />
      <Text> From: {from}</Text>
      <Text> To: {to}</Text>
    </Box>
  );
};

export default Trimmer;