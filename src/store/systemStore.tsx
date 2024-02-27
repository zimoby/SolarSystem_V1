import { create, StateCreator } from "zustand";
import { generateRandomObjects } from "../utils/generators";
import { distOfEarthToSun10_6Km } from "../data/solarSystemData";
import { ObjectsRealtimeDataT, ObjectsSupportDataT, SolarSystemStoreRealtimeStateT, SolarSystemStoreStateT, SystemColorsStateT, SystemStoreStateT } from "../types";

const useSystemColorsSlice: StateCreator<
    SystemColorsStateT,
    [],
    [],
    SystemColorsStateT
  > = (set) => ({
  uiRandomColors: ["red", "green", "blue", "yellow", "purple", "orange", "pink"],
  hudColors: {
    lineUnderOrbit: { color: "green", opacity: 1 },
    lineBelowOrbit: { color: "red", opacity: 1 },
    directLine: { color: "gold", opacity: 1 },
    directLineObject: { color: "blue", opacity: 1 },
  },
  objectDefaultColors: {
    sun: "#ffcc00",
    mercury: "#a9a9a9",
    venus: "#d4a017",
    earth: "#1e90ff",
    mars: "#ff6347",
    jupiter: "#f0e68c",
    saturn: "#c2b280",
    uranus: "#add8e6",
    neptune: "#add8e6",
    pluto: "#a9a9a9",
    moon: "#f0f0f0",
    io: "#f0f0f0",
    europa: "#f0f0f0",
    ganymede: "#f0f0f0",
    callisto: "#f0f0f0",
    titan: "#f0f0f0",
    rhea: "#f0f0f0",
    lapetus: "#f0f0f0",
  },
  updateColors: (updates) => set((state) => ({ ...state, ...updates })),
});

const useSystemStore: StateCreator<
    SystemStoreStateT,
    [],
    [],
    SystemStoreStateT
  > = (set) => ({

  DEV_MODE: import.meta.env.VITE_APP_MODE === "development",
    
  isInitialized: false,
  isInitialized2: false,
  dataInitialized: false,

  sunInitialized: false,
  planetsInitialized: false,
  randomObjectsInitialized: false,
  trashInitialized: false,

  disablePlanets: false,
  disableMoons: false,
  disableRandomObjects: false,
  disableTrash: false,

  activeObjectName: "sun",
  activeObjectNameInfo: "sun",
  activeObjectInfo: {},

  timeSpeed: 35 * 100000,
  timeOffset: 0,
  objectsDistance: 1,
  objectsRelativeScale: 1.4,
  orbitAngleOffset: 0,

  maxDistance: 100,
  minDistance: 0.3,

  orbitPathDetalization: 128,

  updateSystemSettings: (updates) => {
    // console.log("Updating system settings:", updates);
    set((state) => ({ ...state, ...updates }));
  },
  setInitialized: (isInitialized) => set({ isInitialized }),
  setInitialized2: (isInitialized2) => set({ isInitialized2 }),
});

const randomObjectsAmount = 10;

// const trashInnerAmount = 1000;
// const trashMiddleAmount = 1000;
// const trashOuterAmount = 4000;
// const trashCross = 100;

const useSolarSystemStore: StateCreator<
    SolarSystemStoreStateT,
    [],
    [],
    SolarSystemStoreStateT
  > = (set) => ({
  celestialBodies: {
    stars: {},
    planets: {},
    moons: {},
    asteroids: {},
    objects: generateRandomObjects(randomObjectsAmount),
    trash: {
      trashInner1: {
        semimajorAxis10_6Km: distOfEarthToSun10_6Km * 2.5,
      },
      trashInner2: {
        semimajorAxis10_6Km: distOfEarthToSun10_6Km * 2.5,
      },
      trashMiddle1: {
        semimajorAxis10_6Km: distOfEarthToSun10_6Km * 16,
      },
      trashMiddle2: {
        semimajorAxis10_6Km: distOfEarthToSun10_6Km * 16,
      },
      trashOuter1: {
        semimajorAxis10_6Km: distOfEarthToSun10_6Km * 52,
      },
    },
    trashCollection: {
      // trashInner1: generateTrash(trashInnerAmount,        1, 0.25, 1, "inner circle"),
      // trashInner2: generateTrash(trashInnerAmount,        1, 0.25, 1, "inner circle", 2),
      // trashMiddle1: generateTrash(trashMiddleAmount,      1 , 0.6, 1, "middle circle"),
      // trashMiddle2: generateTrash(trashMiddleAmount / 50, 1 , 0.6, 1, "middle circle"),
      // trashOuter1: generateTrash(trashOuterAmount,        1, 0.05, 1, "outer circle"),
      // trashCross: generateCrossingObjects(trashCross, [10, 10, 3]),
    },
  },
  batchUpdateCelestialBodies: (updates) =>
    set((state) => ({
      celestialBodies: {
        ...state.celestialBodies,
        ...updates,
      },
    })),
  additionalProperties: {},
  batchUpdateAdditionalProperties: (updates) => set((state) => {
    const filteredUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as ObjectsSupportDataT);
  
    return {
      additionalProperties: {
        ...state.additionalProperties,
        ...filteredUpdates,
      },
    };
  }),
});

export const useSolarPositionsStore = create<SolarSystemStoreRealtimeStateT>((set) => ({
  properties: {},
  batchUpdateProperties: (updates) => set((state) => {
    const filteredUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, ObjectsRealtimeDataT>);
  
    return {
      properties: {
        ...state.properties,
        ...filteredUpdates,
      },
    };
  }),
}));

export const useSolarStore = create<SystemColorsStateT & SystemStoreStateT & SolarSystemStoreStateT>()((...a) => ({
  ...useSystemColorsSlice(...a),
  ...useSystemStore(...a),
  ...useSolarSystemStore(...a),
}));