import { create } from "zustand";
import { generateCrossingObjects, generateRandomObjects, generateTrash } from "../utils/generators";
import { distOfEarthToSun10_6Km } from "../data/solarSystemData";
import { CalculatedObjectDataT, ObjectsRealtimeDataT, SolarSystemStoreStateT, SystemColorsStateT, SystemStoreStateT } from "../types";

export const useSystemColorsStore = create<SystemColorsStateT>((set) => ({
  uiRandomColors: ["red", "green", "blue", "yellow", "purple", "orange", "pink"],
  hudColors: {
    lineUnderOrbit: { color: "green", opacity: 1 },
    lineBelowOrbit: { color: "red", opacity: 1 },
    directLine: { color: "white", opacity: 1 },
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
  },
  updateColors: (updates) => set((state) => ({ ...state, ...updates })),
}));

export const useSystemStore = create<SystemStoreStateT>((set) => ({
  isInitialized: false,
  isInitialized2: false,
  dataInitialized: false,

  disablePlanets: false,
  disableMoons: true,
  disableRandomObjects: false,
  disableTrash: true,

  activeObjectName: "sun",

  timeSpeed: 1,
  timeOffset: 0,
  objectsDistance: 1,
  objectsRelativeScale: 1,
  orbitAngleOffset: 0,

  maxDistance: 100,
  minDistance: 0.3,

  updateSystemSettings: (updates) => set((state) => ({ ...state, ...updates })),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setInitialized2: (isInitialized2) => set({ isInitialized2 }),
}));

const randomObjectsAmount = 10;

const trashInnerAmount = 1000;
const trashMiddleAmount = 1000;
const trashOuterAmount = 2000;
const trashCross = 100;

export const useSolarSystemStore = create<SolarSystemStoreStateT>((set) => ({
  celestialBodies: {
    stars: {},
    planets: {},
    moons: {},
    asteroids: {},
    objects: generateRandomObjects(randomObjectsAmount),
    trash: {
      trashInner1: {
        semimajorAxis10_6Km: distOfEarthToSun10_6Km * 3,
      },
      trashInner2: {
        semimajorAxis10_6Km: distOfEarthToSun10_6Km * 3,
      },
      trashMiddle1: {
        semimajorAxis10_6Km: distOfEarthToSun10_6Km * 15,
      },
      trashMiddle2: {
        semimajorAxis10_6Km: distOfEarthToSun10_6Km * 15,
      },
      trashOuter1: {
        semimajorAxis10_6Km: distOfEarthToSun10_6Km * 45,
      },
    },
    trashCollection: {
      trashInner1: generateTrash(trashInnerAmount, 0.9, 0.2, 1, "inner circle"),
      trashInner2: generateTrash(trashInnerAmount, 0.9, 0.2, 1, "inner circle", 2),
      trashMiddle1: generateTrash(trashMiddleAmount, 6, 1.7, 1, "middle circle"),
      trashMiddle2: generateTrash(trashMiddleAmount / 50, 6, 1.7, 1, "middle circle"),
      trashOuter1: generateTrash(trashOuterAmount, 3.5, 1, 1, "outer circle"),
      trashCross: generateCrossingObjects(trashCross, [10, 10, 3]),
    },
  },
  batchUpdateCelestialBodies: (updates) =>
    set((state) => ({
      celestialBodies: {
        ...state.celestialBodies,
        ...updates,
      },
    })),
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
  additionalProperties: {},
  batchUpdateAdditionalProperties: (updates) => set((state) => {
    const filteredUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, CalculatedObjectDataT>);
  
    return {
      additionalProperties: {
        ...state.additionalProperties,
        ...filteredUpdates,
      },
    };
  }),
}));
