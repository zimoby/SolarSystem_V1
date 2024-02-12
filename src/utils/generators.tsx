import { MathUtils } from "three";

export const generateTrash = (amount, radius = 1, destr = 0.2, scale = 1, name = "") => {
    const trash = [];
    const angleIncrement = (2 * Math.PI) / amount;
    const ring = 5;

    console.log("generate trash: " + name + ": ", amount);

    for (let i = 0; i < amount; i++) {
        const angle = i * angleIncrement;
        const radiusRandom = Math.pow((Math.random() / ring + ring / 2), 1/1) * radius - ring / 3.5;
        const x = radiusRandom * Math.cos(angle);
        const y = radiusRandom * Math.sin(angle);
        const z = (Math.random() * 2 - 1) * 0.05;

        // Generate random values from a Gaussian distribution
        const updX = (x + (MathUtils.randFloatSpread(2)) * destr) * scale;
        const updY = (y + (MathUtils.randFloatSpread(2)) * destr) * scale;
        const updZ = (z + (MathUtils.randFloatSpread(2)) * destr / 7) * scale;

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

    // console.log("trash", trash);

    return trash;
}

const generateRandomName = () => {
    const size = 5;
    const nameLength = Math.floor(Math.random() * size) + size / 2;
    const characters = 'abcdefghijklmnopqrstuvwxyz1234567890';
    let result = '';
    for (let i = 0; i < nameLength; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}



const objectNumber = 10;

export const generateRandomObjects = () => {
  const randomObjects = {};
  console.log("generate random objects")
  for (let i = 0; i < objectNumber; i++) {
    const randomDistance = Math.random() * 4000;
    randomObjects[`object${i}`] = {
      volumetricMeanRadiusKm: 100,
      semimajorAxis10_6Km: randomDistance,
      anchorXYOffset: { x: 0, y: (Math.random() -0.5) * (randomDistance / 2)},
      siderealOrbitPeriodDays: (Math.random() * 1000) + 400,
      orbitInclinationDeg: Math.random() * 360,
      siderealRotationPeriodHrs: 0,
      orbitEccentricity: Math.random(),
    };
  }
  return randomObjects;
}