export const calculateRelativeDistance = (distance, sliderValue) => {
  return Math.pow(distance, 1 / sliderValue);
};

export const calculateRelativeScale = (size, sliderValue) => {
  return Math.pow(size, 1 / sliderValue) / sliderValue - (sliderValue - 1) * 0.007;
};

export const degreesToRadians = (degrees) => (degrees * Math.PI) / 180;
