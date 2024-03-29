import { MathUtils } from "three";
import { CrossingTrashParamsT, SolarObjectParamsBasicWithMoonsT, TrashParamsT } from "../types";

export const generateCrossingObjects = (
  amount: number,
  boundary: [number, number, number] = [1, 1, 1],
  scale = 1,
  name = ""
): CrossingTrashParamsT[] => {
  false && console.log("generate crossing objects: " + name + ": ", amount);
  const objects: CrossingTrashParamsT[] = [];
  for (let i = 0; i < amount; i++) {
    const position = {
      x: MathUtils.randFloatSpread(boundary[0] * 2),
      y: MathUtils.randFloatSpread(boundary[1] * 2),
      z: MathUtils.randFloatSpread(boundary[2] * 2),
    };

    const velocity = {
      x: MathUtils.randFloatSpread(boundary[0] * 2) * 0.01,
      y: MathUtils.randFloatSpread(boundary[0] * 2) * 0.01,
      z: MathUtils.randFloatSpread(boundary[0] * 2) * 0.01,
    };

    objects.push({
      position,
      velocity,
      scale: Math.random() * scale,
      name: generateRandomName(),
    });
  }
  return objects;
};

export const generateTrash = (
  amount: number,
  radius = 1,
  destr = 0.2,
  scale = 1,
  name = "",
  rotate = 0
): TrashParamsT[] => {
  const trash: TrashParamsT[] = [];
  const angleIncrement = (2 * Math.PI) / amount;
  const ring = 5;
  

  false && console.log("generate trash: " + name + ": ", amount);

  for (let i = 0; i < amount; i++) {
    const angle = i * angleIncrement;
    const radiusRandom = Math.pow(Math.random() / ring + ring / 2, 1 / 1) * radius - ring / 3.5;
    const x = radiusRandom * Math.cos(angle + rotate);
    const y = radiusRandom * Math.sin(angle + rotate);
    const z = (Math.random() * 2 - 1) * 0.05;

    const updX = (x + MathUtils.randFloatSpread(2) * destr) * scale;
    const updY = (y + MathUtils.randFloatSpread(2) * destr) * scale;
    const updZ = (z + (MathUtils.randFloatSpread(2) * destr) / 7) * scale;

    trash.push({
      position: [updX, updY, updZ],
      scale: (Math.random() / 2 + 0.2) * 0.01 * scale,
      rotation: [0, 0, Math.random() * Math.PI],
      distance: Math.sqrt(updX * updX + updY * updY + updZ * updZ),
      angle,
      color: "white",
      name: generateRandomName(),
    });
  }

  return trash;
};

// const trash: TrashParamsT[] = [];
// const angleIncrement = (2 * Math.PI) / amount;
// const ring = 5;

// false && console.log("generate trash: " + name + ": ", amount);

// for (let i = 0; i < amount; i++) {
//   const angle = i * angleIncrement;
//   const radiusRandom = Math.pow(Math.random() / ring + ring / 2, 1 / 1) * radius - ring / 3.5;
//   const x = radiusRandom * Math.cos(angle + rotate);
//   const y = radiusRandom * Math.sin(angle + rotate);
//   const z = (Math.random() * 2 - 1) * 0.05;

//   const updX = (x + MathUtils.randFloatSpread(2) * destr) * scale;
//   const updY = (y + MathUtils.randFloatSpread(2) * destr) * scale;
//   const updZ = (z + (MathUtils.randFloatSpread(2) * destr) / 7) * scale;

//   trash.push({
//     position: [updX, updY, updZ],
//     scale: (Math.random() / 2 + 0.2) * 0.01 * scale,
//     rotation: [0, 0, Math.random() * Math.PI],
//     distance: Math.sqrt(updX * updX + updY * updY + updZ * updZ),
//     angle,
//     color: "white",
//     name: generateRandomName(),
//   });
// }

const generateRandomName = () => {
  const size = 5;
  const nameLength = Math.floor(Math.random() * size) + size / 2;
  const characters = "abcdefghijklmnopqrstuvwxyz1234567890";
  let result = "";
  for (let i = 0; i < nameLength; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const generateRandomObjects = (objectNumber = 10) => {
  const randomObjects: { [key: string]: SolarObjectParamsBasicWithMoonsT } = {};
  false && console.log("generate random objects");
  for (let i = 0; i < objectNumber; i++) {
    const randomDistance = Math.random() * 4000 + 50;
    randomObjects[`object${i}`] = {
      volumetricMeanRadiusKm: 0,
      semimajorAxis10_6Km: randomDistance,
      anchorXYOffset: { x: 0, y: (Math.random() - 0.5) * (randomDistance / 2) },
      siderealOrbitPeriodDays: Math.random() * 1000 + 400,
      orbitInclinationDeg: Math.random() * 180,
      siderealRotationPeriodHrs: 0,
      orbitEccentricity: Math.random() * 0.7,
      obliquityToOrbitDeg: 0
    };
  }
  return randomObjects;
};
