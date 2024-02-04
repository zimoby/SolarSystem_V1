import solarData from "../data/data.json";

export const normalizeDataToEarth = (objData) => {
  const earthData = solarData["earth"];
  const normalizedData = Object.keys(objData).reduce((acc, key) => {
    const planetValue = objData[key];
    const earthValue = earthData[key];

    if (
      typeof planetValue !== "number" ||
      typeof earthValue !== "number" ||
      earthValue === 0 ||
      planetValue === 0
    ) {
      return {
        ...acc,
        [key]: planetValue,
      };
    }

    // console.log("planetValue", planetValue, earthValue);
    const normalizedValue = planetValue / earthValue;
    return {
      ...acc,
      [key]: normalizedValue,
    };
  }, {});
  return normalizedData;
};

export const filterObjectData = (objData, usedProperties) => {
  return Object.keys(objData).reduce((acc, key) => {
    if (usedProperties.includes(key)) {
      return {
        ...acc,
        [key]: objData[key],
      };
    }
    return acc;
  }, {});
}
