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

// const xVec3 = new THREE.Vector3(1, 0, 0);

// export caonst calculateObjectsPosition = (time, celestialBody, quaternionRef) => {
//   const t = ((time / yearInSeconds / celestialBody.siderealOrbitPeriodDays) * timeSpeed + (timeOffset * (Math.PI * 2)) / 365) % (Math.PI * 2);
//   const recalcDistanceX = calculateRelativeDistance(celestialBody.semimajorAxis10_6Km * (1 - celestialBody.orbitEccentricity), objectsDistance);
//   const recalcDistanceY = calculateRelativeDistance(celestialBody.semimajorAxis10_6Km * (1 + celestialBody.orbitEccentricity), objectsDistance);



  
// }