import { dayInSeconds, objectsRotationSpeed, yearInSeconds } from "../data/solarSystemData";
import { useSystemStore } from "../store/systemStore";

export const calculateRelativeDistanceXY = (semimajorAxis10_6Km, orbitEccentricity, sliderValue) => {
  // console.log("calculateRelativeDistanceXY", semimajorAxis10_6Km, orbitEccentricity, sliderValue);
  const offset = 0.75;
  const distanceX = Math.pow(((semimajorAxis10_6Km * (1 - orbitEccentricity)) + offset), 1 / sliderValue) - offset;
  const distanceY = Math.pow(((semimajorAxis10_6Km * (1 + orbitEccentricity)) + offset), 1 / sliderValue) - offset;
  return { x: distanceX, y: distanceY };
}

export const calculateRelativeScale = (size, sliderValue) => {
  const offset = 0.75;
  return Math.pow(size, 1 / sliderValue) / sliderValue;
};

export const degreesToRadians = (degrees) => (degrees * Math.PI) / 180;

export const calculateObjectsRotation = (time, periodHrs, timeSpeed) => {
  return ((time * Math.PI * 2) / dayInSeconds / periodHrs * objectsRotationSpeed * useSystemStore.getState().timeSpeed ) % (Math.PI * 2);
}

export const calculateTime = (time, periodDays, timeSpeed, timeOffset) => {
  return (((time * Math.PI * 2) / yearInSeconds / periodDays) * timeSpeed + (timeOffset * (Math.PI * 2)) / 365) % (Math.PI * 2);
};