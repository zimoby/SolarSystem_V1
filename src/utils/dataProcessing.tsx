import solarData from "../data/data.json";
import { distOfEarthToSun10_6Km } from "../data/solarSystemData";
import { OnlyNumbericSolarObjectParamsBasicT, SolarObjectParamsBasicT } from "../types";

export const normalizeDataToEarth = (
  objData: OnlyNumbericSolarObjectParamsBasicT,
  ignoreToNormalize: string[]
): OnlyNumbericSolarObjectParamsBasicT => {
  const earthData = solarData["earth"] as OnlyNumbericSolarObjectParamsBasicT;
  const normalizedData = Object.keys(objData).reduce((acc, key) => {

    if (key === "anchorXYOffset") {
      return {
        ...acc,
        [key]: {
          x: ((objData[key as keyof OnlyNumbericSolarObjectParamsBasicT] as unknown as { x: number; y: number; })?.x / distOfEarthToSun10_6Km),
          y: ((objData[key as keyof OnlyNumbericSolarObjectParamsBasicT] as unknown as { x: number; y: number; })?.y / distOfEarthToSun10_6Km),
        },
      }
    }

    if (typeof earthData[key as keyof OnlyNumbericSolarObjectParamsBasicT] === "undefined") {
      return acc;
    }

    const planetValue = objData[key as keyof OnlyNumbericSolarObjectParamsBasicT];
    const earthValue = earthData[key as keyof OnlyNumbericSolarObjectParamsBasicT];

    if (
      typeof planetValue !== "number" ||
      typeof earthValue !== "number" ||
      earthValue === 0 ||
      planetValue === 0 ||
      ignoreToNormalize.includes(key)
    ) {
      return {
        ...acc,
        [key]: planetValue,
      };
    }

    const normalizedValue = planetValue / earthValue;
    return {
      ...acc,
      [key]: normalizedValue,
    };
  }, {});

  return normalizedData;
};

export const filterObjectData = (
  objData: SolarObjectParamsBasicT,
  usedProperties: string[]
): SolarObjectParamsBasicT => {
  return Object.keys(objData).reduce((acc, key) => {
    if (usedProperties.includes(key)) {
      return {
        ...acc,
        [key]: objData[key as keyof SolarObjectParamsBasicT],
      };
    }
    return acc;
  }, {});
};
