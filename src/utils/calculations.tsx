export const calculateRelativeDistance = (distance, sliderValue) => {
  const offset = 0.75;
  return Math.pow((distance + offset), 1 / sliderValue) - offset;
};

export const calculateRelativeScale = (size, sliderValue) => {
  const offset = 0.75;
  return Math.pow(size, 1 / sliderValue) / sliderValue;
  // return Math.pow(size, 1 / sliderValue) / sliderValue - (sliderValue - 1) * 0.007;
};

export const degreesToRadians = (degrees) => (degrees * Math.PI) / 180;
