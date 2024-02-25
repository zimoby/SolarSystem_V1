import { dayInSeconds, objectsRotationSpeed, yearInSeconds } from "../data/solarSystemData";

export const calculateRelativeDistanceXY = (
  semimajorAxis10_6Km: number,
  orbitEccentricity: number,
  sliderValue: number,
  maxDistance: number,
  minDistance: number,
  name: string = ""
): { x: number; y: number } => {
  // console.log("calculateRelativeDistanceXY", semimajorAxis10_6Km, orbitEccentricity, sliderValue);
  const offset = -minDistance.toFixed(1);
  // const farObject = 60;
  // const distanceX = Math.pow(((semimajorAxis10_6Km * (1 - orbitEccentricity)) + offset), 1 / sliderValue) - offset;
  // const distanceY = Math.pow(((semimajorAxis10_6Km * (1 + orbitEccentricity)) + offset), 1 / sliderValue) - offset;
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

// export const calculateDistanceXY = (semimajorAxis10_6Km, orbitEccentricity, sliderValue, name = "") => {
//   // console.log("calculateRelativeDistanceXY", semimajorAxis10_6Km, orbitEccentricity, sliderValue);
//   const distanceX = (semimajorAxis10_6Km * (1 - orbitEccentricity)) * sliderValue;
//   const distanceY = (semimajorAxis10_6Km * (1 + orbitEccentricity)) * sliderValue;

//   // console.log("calculateRelativeDistanceXY", name, sliderValue, [distanceX, distanceY], {semimajorAxis10_6Km, orbitEccentricity});

//   return { x: distanceX, y: distanceY };
// }

export const calculateRelativeScale = (size: number, relativeScale: number, name: string = ""): number => {
  // const offset = 0.75;
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

// export const calculatePosition = ({name, positionVectorsRef, time, timeSpeed, timeOffset, supportData, siderealOrbitPeriodDays, quaternionRef}) => {

//   // console.log("calculatePosition", supportData, time, timeSpeed, timeOffset, siderealOrbitPeriodDays);

//   const moonsCompenstation = supportData.type === "moons" ? moonsRotationSpeed : 1;
//   const t = calculateTime(
//     time,
//     (siderealOrbitPeriodDays || 365) * moonsCompenstation,
//     timeSpeed,
//     timeOffset
//   );

//   positionVectorsRef.current[name].set(
//     Math.cos(t) * supportData.distanceXY.x,
//     0,
//     Math.sin(t) * supportData.distanceXY.y
//   );

//   quaternionRef.current.setFromAxisAngle({x: 1, y: 0, z: 0}, supportData.angleRad);
//   positionVectorsRef.current[name].applyQuaternion(quaternionRef.current);

//   return positionVectorsRef;
// }