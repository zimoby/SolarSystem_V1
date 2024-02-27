import solarData from "../data/data.json";

// const solarSystemDataLink =
//   "https://github.com/sempostma/planetary-factsheet/blob/2a108f418ebefbc3859d5a27e09f71bf5367eafd/data.json";

export const distOfEarthToSun10_6Km = 149.6;

const earchRadiusKm = 6371;
const distanceToSunKm = 149.6 * 10 ** 6;
export const relativeEarthSizeDependOnDistance = earchRadiusKm / distanceToSunKm;

export const planetsScaleFactor = relativeEarthSizeDependOnDistance * 1200;
export const starsScaleFactor = relativeEarthSizeDependOnDistance * 10;
export const objectsRotationSpeed = 100
export const moonsRotationSpeed = 500
export const moonsDistanceFactor = relativeEarthSizeDependOnDistance * 6000000 / 2;

export const yearInSeconds = 60 * 60 * 24 * 365;
export const dayInSeconds = 60 * 60 * 24;

export const planetsNamesOrder: (keyof typeof solarData)[] = [
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
];
