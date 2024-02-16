export const distOfEarthToSun10_6Km = 149.6;

const earthDiameterKm = 12756;
const earchRadiusKm = 6371;
const sunRadiusKm = 696340;
const distanceToSunKm = 149.6 * 10 ** 6;
const relativeEarthSizeDependOnDistance = earchRadiusKm / distanceToSunKm;

// console.log("relativeEarthSizeDependOnDistance", relativeEarthSizeDependOnDistance);

export const planetsScaleFactor = relativeEarthSizeDependOnDistance * 500;
export const starsScaleFactor = 10;
export const objectsRotationSpeed = 0.01

export const yearInSeconds = 60 * 60 * 24 * 365;
export const dayInSeconds = 60 * 60 * 24;

export const planetsNamesOrder = [
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

const solarSystemDataLink =
  "https://github.com/sempostma/planetary-factsheet/blob/2a108f418ebefbc3859d5a27e09f71bf5367eafd/data.json";
