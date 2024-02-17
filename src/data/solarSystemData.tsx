import solarData from "../data/data.json";

export const distOfEarthToSun10_6Km = 149.6;

// const earthDiameterKm = 12756;
const earchRadiusKm = 6371;
// const sunRadiusKm = 696340;
const distanceToSunKm = 149.6 * 10 ** 6;
const relativeEarthSizeDependOnDistance = earchRadiusKm / distanceToSunKm;

// console.log("relativeEarthSizeDependOnDistance", relativeEarthSizeDependOnDistance);

export const planetsScaleFactor = relativeEarthSizeDependOnDistance * 1200;
export const starsScaleFactor = 50;
export const objectsRotationSpeed = 0.01

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
