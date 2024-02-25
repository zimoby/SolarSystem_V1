import { dayInSeconds, objectsRotationSpeed, yearInSeconds } from "../data/solarSystemData";

export const calculateRelativeDistanceXY = (
  semimajorAxis10_6Km: number,
  orbitEccentricity: number,
  sliderValue: number,
  maxDistance: number,
  minDistance: number,
  name: string = ""
): { x: number; y: number } => {
  const offset = -minDistance.toFixed(1);
  const distanceX = semimajorAxis10_6Km * (1 - orbitEccentricity) + offset;
  const distanceY = semimajorAxis10_6Km * (1 + orbitEccentricity) + offset;

  const relativeDistanceX = Math.pow(distanceX / maxDistance, 1 / sliderValue);
  const relativeDistanceY = Math.pow(distanceY / maxDistance, 1 / sliderValue);

  const backDistanceX = relativeDistanceX * maxDistance - offset;
  const backDistanceY = relativeDistanceY * maxDistance - offset;

  false && console.log(
    "calculateRelativeDistanceXY",
    name,
    sliderValue,
    [backDistanceX, backDistanceY],
    maxDistance,
    minDistance.toFixed(1)
  );

  return { x: backDistanceX, y: backDistanceY };
};

export const calculateRelativeScale = (size: number, relativeScale: number, name: string = ""): number => {
  const calcRelativeScale = Math.pow(size, 1 / relativeScale) / relativeScale;

  false && console.log("RelativeScale", name, calcRelativeScale, size, relativeScale)

  return calcRelativeScale;
};

export const degreesToRadians = (degrees: number): number => (degrees * Math.PI) / 180;

export const calculateObjectsRotation = (time: number, periodHrs: number, timeSpeed: number) => {
  return (
    (((time * Math.PI * 2) / dayInSeconds / periodHrs) /
      objectsRotationSpeed *
      timeSpeed) %
    (Math.PI * 2)
  );
};

export const calculateTime = (
  time: number,
  periodDays: number,
  timeSpeed: number,
  timeOffset: number
): number => {
  return (
    (((time * Math.PI * 2) / yearInSeconds / periodDays) * timeSpeed +
      (timeOffset * (Math.PI * 2)) / 365) %
    (Math.PI * 2)
  );
};
