import solarData from "../data/data.json";

export const distOfEarthToSun10_6Km = 149.6;

// const earthDiameterKm = 12756;
const earchRadiusKm = 6371;
// const sunRadiusKm = 696340;
const distanceToSunKm = 149.6 * 10 ** 6;
export const relativeEarthSizeDependOnDistance = earchRadiusKm / distanceToSunKm;

// console.log("relativeEarthSizeDependOnDistance", relativeEarthSizeDependOnDistance);

export const planetsScaleFactor = relativeEarthSizeDependOnDistance * 1200;
export const starsScaleFactor = relativeEarthSizeDependOnDistance * 10;
export const objectsRotationSpeed = 100
export const moonsRotationSpeed = 500
export const moonsDistanceFactor = relativeEarthSizeDependOnDistance * 8000000 / 2;

// console.log("planetsScaleFactor", relativeEarthSizeDependOnDistance * 5000000);

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

// const solarSystemDataLink =
//   "https://github.com/sempostma/planetary-factsheet/blob/2a108f418ebefbc3859d5a27e09f71bf5367eafd/data.json";
