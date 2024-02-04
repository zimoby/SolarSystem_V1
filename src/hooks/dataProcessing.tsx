import { useEffect, useMemo } from "react";
import starsData from "../data/starsData.json";
import solarData from "../data/data.json";
import { planetsNamesOrder, planetsScaleFactor } from "../data/solarSystemData";
import { filterObjectData, normalizeDataToEarth } from "../utils/dataProcessing";
import { useSolarSystemStore, useSystemStore } from "../store/systemStore";
import { useFrame } from "@react-three/fiber";
import { calculateRelativeDistance, degreesToRadians } from "../utils/calculations";
import * as THREE from "three";

export const useInitiateSolarSystem = () => {
  const usedProperties = [
    "volumetricMeanRadiusKm",
    "semimajorAxis10_6Km",
    "siderealOrbitPeriodDays",
    "orbitInclinationDeg",
  ];
  const sunData = starsData["sun"];

  const reorderPlanets = useMemo(() => {
    // reorder object
    return planetsNamesOrder.reduce((acc, planetName) => {
      const planetData = solarData[planetName];
      return {
        ...acc,
        [planetName]: planetData,
      };
    }, {});
  }, []);

  useEffect(() => {
    //process planets data
    Object.keys(reorderPlanets).forEach((planetName) => {
      const planetData = reorderPlanets[planetName];

      // Prepare planet data excluding moons for adding to the store
      const { moons, ...planetWithoutMoonData } = planetData;

      // processing planets data
      const filterPlanetData = filterObjectData(planetWithoutMoonData, usedProperties);
      const normalizedPlanetData = normalizeDataToEarth(filterPlanetData);
      const additionalProcessingParams = Object.keys(normalizedPlanetData).reduce((acc, key) => {
        if (key === "volumetricMeanRadiusKm") {
          return {
            ...acc,
            [key]: normalizedPlanetData[key] / planetsScaleFactor, // /1000000
          };
          // } else if (key === "semimajorAxis10_6Km") {
          //   return {
          //     ...acc,
          //     [key]: normalizedPlanetData[key] // calculateAdjustedLog(normalizedPlanetData[key], 0) // Math.pow(normalizedPlanetData[key], 1 / relativeDistanceToSun)
          //   }
        } else {
          return {
            ...acc,
            [key]: normalizedPlanetData[key],
          };
        }
      }, {});

      // Add planet data
      useSolarSystemStore
        .getState()
        .addCelestialBody("planets", planetName, additionalProcessingParams);

      // Add moons if they exist
      if (planetData.moons && planetData.moons.length > 0) {
        planetData.moons.forEach((moon) => {
          const filterMoonsData = filterObjectData(moon, usedProperties);
          const normalizedMoonData = normalizeDataToEarth(filterMoonsData);
          const updatedMoonData = {
            ...normalizedMoonData,
            type: planetName, // Assuming 'type' indicates the moon's parent planet
          };
          useSolarSystemStore.getState().addCelestialBody("moons", moon.name, updatedMoonData);
        });
      }

      // Initialize default position and rotation for each planet
      useSolarSystemStore
        .getState()
        .addCelestialBodyProperty(planetName, "position", new THREE.Vector3(0, 0, 0));
      useSolarSystemStore
        .getState()
        .addCelestialBodyProperty(planetName, "rotation", new THREE.Euler(0, 0, 0));
    });

    // process sun data
    // const sunData = useSolarSystemStore.getState().celestialBodies.stars.sun;
    const normalizedSunData = normalizeDataToEarth(sunData);
    useSolarSystemStore.getState().addCelestialBody("stars", "sun", normalizedSunData);
    useSolarSystemStore
      .getState()
      .addCelestialBodyProperty("sun", "position", new THREE.Vector3(0, 0, 0));
    useSolarSystemStore
      .getState()
      .addCelestialBodyProperty("sun", "rotation", new THREE.Euler(0, 0, 0));
  }, []);
};

export const useCelestialBodyUpdates = () => {
  const frameRate = 30;
  const frameInterval = 1 / frameRate;

  useFrame((state, delta) => {
    const properties = useSolarSystemStore.getState().properties;

    // if (state.clock.getElapsedTime() % frameInterval < delta) {
    //   updateCelestialBodyPositions(t, properties);
    // }
    Object.keys(properties).forEach((name) => {
      const celestialBody = useSolarSystemStore.getState().celestialBodies.planets[name] || {};

      if (celestialBody.semimajorAxis10_6Km) {
        const t =
          (((state.clock.getElapsedTime() * Math.PI * 2) /
            60 /
            60 /
            24 /
            365 /
            celestialBody.siderealOrbitPeriodDays) *
            useSystemStore.getState().timeSpeed +
            (useSystemStore.getState().timeOffset * (Math.PI * 2)) / 365) %
          (Math.PI * 2);
        const recalcDistance = calculateRelativeDistance(
          celestialBody.semimajorAxis10_6Km,
          useSystemStore.getState().objectsDistance
        );
        // Position update logic
        const newPosition = new THREE.Vector3(
          Math.cos(t) * recalcDistance,
          0,
          Math.sin(t) * recalcDistance
        );
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(
          new THREE.Vector3(1, 0, 0),
          degreesToRadians(
            celestialBody.orbitInclinationDeg + useSystemStore.getState().orbitAngleOffset
          )
        );
        newPosition.applyQuaternion(quaternion);

        // Rotation update logic
        const currentRotation = properties[name]?.rotation || new THREE.Euler(0, 0, 0);
        const newRotation = new THREE.Euler(
          currentRotation.x,
          currentRotation.y + 0.01,
          currentRotation.z
        );

        // Updating the store
        useSolarSystemStore.getState().updateProperty(name, "position", newPosition);
        useSolarSystemStore.getState().updateProperty(name, "rotation", newRotation);

        // console.log("planet name", name, newPosition);
      }
    });
    // }
  });
};
