import { create } from "zustand";
import { devtools } from "zustand/middleware";

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

export const useSystemStore = create(
  devtools((set) => ({
    activeObjectName: "sun",
    timeSpeed: 1,
    timeOffset: 0,
    objectsDistance: 1,
    objectsRelativeScale: 1,
    orbitAngleOffset: 0,

    updateSystemSettings: (updates) => set((state) => ({ ...state, ...updates })),
  }))
);

export const useSolarSystemStore = create(
  devtools((set) => ({
    // Static data: Basic information about celestial bodies
    celestialBodies: {
      stars: {},
      planets: {},
      moons: {},
      asteroids: {},
      objects: {},
    },
    // Function to add celestial bodies dynamically
    addCelestialBody: (type, name, data) =>
      set((state) => ({
        celestialBodies: {
          ...state.celestialBodies,
          [type]: {
            ...state.celestialBodies[type],
            [name]: data,
          },
        },
      })),
    // Dynamic data: User-controllable properties (e.g., sliders for size and distance)
    updateCelestialBody: (type, name, updates) =>
      set((state) => ({
        celestialBodies: {
          ...state.celestialBodies,
          [type]: {
            ...state.celestialBodies[type],
            [name]: { ...state.celestialBodies[type][name], ...updates },
          },
        },
      })),

    //Real-time data: Properties of celestial bodies
    properties: {},
    addCelestialBodyProperty: (name, property, value) =>
      set((state) => ({
        properties: {
          ...state.properties,
          [name]: {
            ...state.properties[name],
            [property]: value,
          },
        },
      })),
    updateProperty: (name, property, value) =>
      set((state) => ({
        properties: {
          ...state.properties,
          [name]: {
            ...state.properties[name],
            [property]: value,
          },
        },
      })),
  }))
);
