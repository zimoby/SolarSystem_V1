import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import * as THREE from "three";

// interface ISystemStore {
//     planetPosition: THREE.Vector3;
//     setPlanetPosition: (position: THREE.Vector3) => void;
// }

export const useSystemStore = create(devtools((set) => ({
    activeObjectName : '',
    setActiveObjectName : (name: string) => set({activeObjectName: name}),
    timeSpeed: 1,
    setTimeSpeed: (speed: number) => set({timeSpeed: speed}),
    timeOffset: 0,
    setTimeOffset: (offset: number) => set({timeOffset: offset}),
    objectsDistance: 1,
    setObjectsDistance: (distance: number) => set({objectsDistance: distance}),
    objectsRelativeScale: 1,
    setObjectsRelativeScale: (scale: number) => set({objectsRelativeScale: scale}),
    orbitAngleOffset: 0,
    setOrbitAngleOffset: (offset: number) => set({orbitAngleOffset: offset}),
})));

export const useSolarSystemStore = create(devtools((set) => ({
    // Static data: Basic information about celestial bodies
    celestialBodies: {
        stars: {},
        planets: {},
        moons: {},
        asteroids: {},
        objects: {},
    },
  // Function to add celestial bodies dynamically
    addCelestialBody: (type, name, data) => set((state) => ({
        celestialBodies: {
            ...state.celestialBodies,
            [type]: {
                ...state.celestialBodies[type],
                [name]: data
            }
        },
    })),
    // Dynamic data: User-controllable properties (e.g., sliders for size and distance)
    updateCelestialBody: (type, name, updates) => set((state) => ({
        celestialBodies: {
          ...state.celestialBodies,
          [type]: {
            ...state.celestialBodies[type],
            [name]: { ...state.celestialBodies[type][name], ...updates }
          },
        },
      })),

    //Real-time data: Properties of celestial bodies
    properties: {
        sun: {
            position: new THREE.Vector3(0, 0, 0),
            rotation: new THREE.Euler(0, 0, 0),
        },
    },
    addCelestialBodyProperty: (name, property, value) => set((state) => ({
        properties: {
            ...state.properties,
            [name]: {
                ...state.properties[name],
                [property]: value,
            },
        },
    })),
    updateProperty: (name, property, value) => set((state) => ({
        properties: {
            ...state.properties,
            [name]: {
                ...state.properties[name],
                [property]: value,
            },
        },
    })),

})));