import { create } from "zustand";
import { devtools } from "zustand/middleware";
import * as THREE from "three";
import { generateRandomObjects, generateTrash } from "../utils/generators";

interface CelestialBody {
  [key: string]: any; // Replace `any` with a more specific type based on your data structure
}

interface SystemState {
  activeObjectName: string;
  timeSpeed: number;
  timeOffset: number;
  objectsDistance: number;
  objectsRelativeScale: number;
  orbitAngleOffset: number;
  celestialBodies: {
    stars: { [key: string]: CelestialBody };
    planets: { [key: string]: CelestialBody };
    moons: { [key: string]: CelestialBody };
    asteroids: { [key: string]: CelestialBody };
    objects: { [key: string]: CelestialBody };
  };
  properties: { [key: string]: any }; // Again, replace `any` with something more specific
  updateSystemSettings: (updates: Partial<SystemState>) => void;
  modifyCelestialBody: (
    type: keyof SystemState["celestialBodies"],
    name: string,
    data: CelestialBody | Partial<CelestialBody>,
    isUpdate?: boolean
  ) => void;
}

export const useSystemColorsStore = create(
  devtools((set) => ({
    uiRandomColors: ["red", "green", "blue", "yellow", "purple", "orange", "pink"],
    hudColors: {
      // background: "#000000",
      // text: "#ffffff",
      // border: "#ffffff",
      lineUnderOrbit: {color: "green", opacity: 1},
      lineBelowOrbit: {color: "red", opacity: 1},
      directLine: {color: "white", opacity: 1},
    },
    // objectDefaultColors: {
    //   sun: "#ffcc00",
    //   mercury: "#a9a9a9",
    //   venus: "#d4a017",
    //   earth: "#1e90ff",
    //   mars: "#ff6347",
    //   jupiter: "#f0e68c",
    //   saturn: "#c2b280",
    //   uranus: "#add8e6",
    //   neptune: "#add8e6",
    //   pluto: "#a9a9a9",
    //   moon: "#f0f0f0",
    // },
    updateColors: (updates) => set({ colors: { ...colors, ...updates } }),
  }))
);

export const useSystemStore = create(
  devtools((set) => ({
    isInitialized: false,
    isInitialized2: false,
    dataInitialized: false,

    disablePlanets: false,
    disableMoons: true,
    disableRandomObjects: false,
    disableTrash: false,
    
    activeObjectName: "sun",

    solarScale: 1,
    timeSpeed: 1,
    timeOffset: 0,
    objectsDistance: 1,
    objectsRelativeScale: 1,
    orbitAngleOffset: 0,

    updateSystemSettings: (updates) => set((state) => ({ ...state, ...updates })),
    setInitialized: (isInitialized) => set({ isInitialized }),
    setInitialized2: (isInitialized2) => set({ isInitialized2 }),
  }))
);



// const generateLinesGeometry = (objectNumber) => {
//   const lines = {};
//   for (let i = 0; i < objectNumber; i++) {
//     const pointsArray = new Float32Array(6); // 2 points x 3 coordinates (start and end)
//     const bufferGeometry = new THREE.BufferGeometry();
//     bufferGeometry.setAttribute('position', new THREE.BufferAttribute(pointsArray, 3));
//     lines[`line${i}`] = {
//       material: new THREE.LineBasicMaterial({ color: 0xffffff }),
//       bufferGeometry: bufferGeometry,
//       pointsArray: pointsArray,
//     };
//   }
//   return lines;
// };

export const useSolarAmounOfItems = create(
  devtools(() => ({

  }))
);

const trashInnerAmount = 1000;
const trashMiddleAmount = 1000;
const trashOuterAmount = 3000;


export const useSolarSystemStore = create(
  devtools((set) => ({
    // Static data: Basic information about celestial bodies
    celestialBodies: {
      stars: {},
      planets: {},
      moons: {},
      asteroids: {},
      objects: generateRandomObjects(),
      trash: {
        trashInner1: generateTrash(trashInnerAmount, 1, 0.2, 1, "inner circle"),
        trashInner2: generateTrash(trashInnerAmount, 1, 0.2, 1, "inner circle"),

        trashMiddle1: generateTrash(trashMiddleAmount, 2, 1.7, 1, "middle circle"),
        trashMiddle2: generateTrash(trashMiddleAmount/50, 2, 1.7, 1, "middle circle"),
        
        trashOuter1: generateTrash(trashOuterAmount, 3.5, 1, 1, "outer circle"),
      },
    },

    // objectLines: generateLinesGeometry(objectNumber),

    // // Function to add celestial bodies dynamically
    // addCelestialBody: (type, name, data) =>
    //   set((state) => ({
    //     celestialBodies: {
    //       ...state.celestialBodies,
    //       [type]: {
    //         ...state.celestialBodies[type],
    //         [name]: data,
    //       },
    //     },
    //   })),
    // // Dynamic data: User-controllable properties (e.g., sliders for size and distance)
    // updateCelestialBody: (type, name, updates) =>
    //   set((state) => ({
    //     celestialBodies: {
    //       ...state.celestialBodies,
    //       [type]: {
    //         ...state.celestialBodies[type],
    //         [name]: { ...state.celestialBodies[type][name], ...updates },
    //       },
    //     },
    //   })),

    // Batch updates
    batchUpdateCelestialBodies: (updates) =>
      set((state) => ({
        celestialBodies: {
          ...state.celestialBodies,
          ...updates,
        },
      })),

    //Real-time data: Properties of celestial bodies
    properties: {},
    // addCelestialBodyProperty: (name, property, value) =>
    //   set((state) => ({
    //     properties: {
    //       ...state.properties,
    //       [name]: {
    //         ...state.properties[name],
    //         [property]: value,
    //       },
    //     },
    //   })),
    // updateProperty: (name, property, value) =>
    //   set((state) => ({
    //     properties: {
    //       ...state.properties,
    //       [name]: {
    //         ...state.properties[name],
    //         [property]: value,
    //       },
    //     },
    //   })),
    batchUpdateProperties: (updates) =>
      set((state) => ({
        properties: {
          ...state.properties,
          ...updates,
        },
      })),
      
    additionalProperties: {},

    batchUpdateAdditionalProperties: (updates) =>
      {
        console.log("batchUpdateAdditionalProperties", updates);
        set((state) => ({
        additionalProperties: {
          ...state.additionalProperties,
          ...updates,
        },
      }))},
  }))
);
