import { dayInSeconds, objectsRotationSpeed, yearInSeconds } from "../data/solarSystemData";
import { useSystemStore } from "../store/systemStore";

export const calculateRelativeDistanceXY = (semimajorAxis10_6Km, orbitEccentricity, sliderValue, maxDistance, minDistance, name = "") => {
  // console.log("calculateRelativeDistanceXY", semimajorAxis10_6Km, orbitEccentricity, sliderValue);
  const offset = -minDistance.toFixed(1);
  // const farObject = 60;
  // const distanceX = Math.pow(((semimajorAxis10_6Km * (1 - orbitEccentricity)) + offset), 1 / sliderValue) - offset;
  // const distanceY = Math.pow(((semimajorAxis10_6Km * (1 + orbitEccentricity)) + offset), 1 / sliderValue) - offset;
  const distanceX = (semimajorAxis10_6Km * (1 - orbitEccentricity) + offset);
  const distanceY = (semimajorAxis10_6Km * (1 + orbitEccentricity) + offset);

  const relativeDistanceX = Math.pow(distanceX / maxDistance, 1 / sliderValue);
  const relativeDistanceY = Math.pow(distanceY / maxDistance, 1 / sliderValue);

  const backDistanceX = relativeDistanceX * maxDistance - offset;
  const backDistanceY = relativeDistanceY * maxDistance - offset;

  console.log("calculateRelativeDistanceXY", name, sliderValue, [backDistanceX, backDistanceY],  maxDistance, (minDistance.toFixed(1)));

  return { x: backDistanceX, y: backDistanceY };
}

// export const calculateDistanceXY = (semimajorAxis10_6Km, orbitEccentricity, sliderValue, name = "") => {
//   // console.log("calculateRelativeDistanceXY", semimajorAxis10_6Km, orbitEccentricity, sliderValue);
//   const distanceX = (semimajorAxis10_6Km * (1 - orbitEccentricity)) * sliderValue;
//   const distanceY = (semimajorAxis10_6Km * (1 + orbitEccentricity)) * sliderValue;

//   // console.log("calculateRelativeDistanceXY", name, sliderValue, [distanceX, distanceY], {semimajorAxis10_6Km, orbitEccentricity});

//   return { x: distanceX, y: distanceY };
// }

export const calculateRelativeScale = (size, relativeScale, name = "") => {
  const offset = 0.75;
  const calcRelativeScale = Math.pow(size, 1 / relativeScale) / relativeScale;

  // console.log("RelativeScale", name, calcRelativeScale, size, relativeScale)

  return calcRelativeScale;
};

export const degreesToRadians = (degrees) => (degrees * Math.PI) / 180;

export const calculateObjectsRotation = (time, periodHrs, timeSpeed) => {
  return ((time * Math.PI * 2) / dayInSeconds / periodHrs * objectsRotationSpeed * useSystemStore.getState().timeSpeed ) % (Math.PI * 2);
}

export const calculateTime = (time, periodDays, timeSpeed, timeOffset) => {
  return (((time * Math.PI * 2) / yearInSeconds / periodDays) * timeSpeed + (timeOffset * (Math.PI * 2)) / 365) % (Math.PI * 2);
};