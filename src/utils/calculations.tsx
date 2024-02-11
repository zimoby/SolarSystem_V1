import { dayInSeconds, objectsRotationSpeed, yearInSeconds } from "../data/solarSystemData";
import { useSystemStore } from "../store/systemStore";

export const calculateRelativeDistanceXY = (semimajorAxis10_6Km, orbitEccentricity, sliderValue) => {
  const offset = 0.75;
  const distanceX = Math.pow(((semimajorAxis10_6Km * (1 - orbitEccentricity)) + offset), 1 / sliderValue) - offset;
  const distanceY = Math.pow(((semimajorAxis10_6Km * (1 + orbitEccentricity)) + offset), 1 / sliderValue) - offset;
  return { x: distanceX, y: distanceY };
}

export const calculateRelativeScale = (size, sliderValue) => {
  const offset = 0.75;
  return Math.pow(size, 1 / sliderValue) / sliderValue;
  // return Math.pow(size, 1 / sliderValue) / sliderValue - (sliderValue - 1) * 0.007;
};

export const degreesToRadians = (degrees) => (degrees * Math.PI) / 180;

// const xVec3 = new THREE.Vector3(1, 0, 0);

// export caonst calculateObjectsPosition = (time, celestialBody, quaternionRef) => {
//   const t = ((time / yearInSeconds / celestialBody.siderealOrbitPeriodDays) * timeSpeed + (timeOffset * (Math.PI * 2)) / 365) % (Math.PI * 2);
//   const recalcDistanceX = calculateRelativeDistance(celestialBody.semimajorAxis10_6Km * (1 - celestialBody.orbitEccentricity), objectsDistance);
//   const recalcDistanceY = calculateRelativeDistance(celestialBody.semimajorAxis10_6Km * (1 + celestialBody.orbitEccentricity), objectsDistance);



  
// }

export const calculateObjectsRotation = (time, periodHrs) => {
  // (timeSec / dayInSeconds / useSolarSystemStore.getState().celestialBodies.planets[planetName].siderealRotationPeriodHrs * objectsRotationSpeed * timeSpeed) % (Math.PI * 2);
  return ((time * Math.PI * 2) / dayInSeconds / periodHrs * objectsRotationSpeed * useSystemStore.getState().timeSpeed ) % (Math.PI * 2);
}

export const calculateTime = (time, periodDays) => {
  const { timeSpeed, timeOffset } = useSystemStore.getState();
  return (((time * Math.PI * 2) / yearInSeconds / periodDays) * timeSpeed + (timeOffset * (Math.PI * 2)) / 365) % (Math.PI * 2);
}