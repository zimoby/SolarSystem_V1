import { useEffect, useMemo } from "react";
import starsData from "../data/starsData.json";
import solarData from "../data/data.json";
import { dayInSeconds, objectsRotationSpeed, planetsNamesOrder, planetsScaleFactor, yearInSeconds } from "../data/solarSystemData";
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
    "siderealRotationPeriodHrs",
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
    console.log("start init");
    //process planets data
    Object.keys(reorderPlanets).forEach((planetName) => {
      const planetData = reorderPlanets[planetName];

      // Prepare planet data excluding moons for adding to the store
      const { moons, ...planetWithoutMoonData } = planetData;

      // processing planets data
      const filterPlanetData = filterObjectData(planetWithoutMoonData, usedProperties);
      const normalizedPlanetData = normalizeDataToEarth(filterPlanetData);
      const additionalProcessingParams = {
        ...normalizedPlanetData,
        volumetricMeanRadiusKm: normalizedPlanetData.volumetricMeanRadiusKm / planetsScaleFactor,
      };

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
            volumetricMeanRadiusKm: normalizedMoonData.volumetricMeanRadiusKm / planetsScaleFactor,
            semimajorAxis10_6Km: normalizedMoonData.semimajorAxis10_6Km,
            type: planetName, // Assuming 'type' indicates the moon's parent planet
          };
          useSolarSystemStore.getState().addCelestialBody("moons", moon.name, updatedMoonData);
          useSolarSystemStore.getState().addCelestialBodyProperty(moon.name, "position", new THREE.Vector3(0, 0, 0));
          useSolarSystemStore.getState().addCelestialBodyProperty(moon.name, "rotation", new THREE.Euler(0, 0, 0));
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
    const filterSunData = filterObjectData(sunData, usedProperties);
    const normalizedSunData = normalizeDataToEarth(filterSunData);
    console.log("normalizedSunData", normalizedSunData);
    useSolarSystemStore.getState().addCelestialBody("stars", "sun", normalizedSunData);
    // useSolarSystemStore
    //   .getState()
    //   .addCelestialBodyProperty("sun", "position", new THREE.Vector3(0, 0, 0));
    // useSolarSystemStore
    //   .getState()
    //   .addCelestialBodyProperty("sun", "rotation", new THREE.Euler(0, 0, 0));
    useSystemStore.getState().updateSystemSettings({ dataInitialized: true });
  }, []);
};

export const useCelestialBodyUpdates = () => {
  const frameRate = 30;
  const frameInterval = 1 / frameRate;
  const dataInitialized = useSystemStore.getState().dataInitialized;

  // console.log("dataInitialized", dataInitialized);

  // const celestialBodies = useSolarSystemStore.getState().celestialBodies;

  // const cosmicObjects = useMemo(() => {
  //   return {...celestialBodies.planets, ...celestialBodies.stars};
  // }, [dataInitialized]);  


  // console.log("planets", planets);
  
  useFrame((state, delta) => {
    const planets = useSolarSystemStore.getState().celestialBodies.planets;
    const moons = useSolarSystemStore.getState().celestialBodies.moons;

    const combinedObjects = {
      ...planets,
      ...moons,
    };

    const time = state.clock.getElapsedTime();

    // console.log("delta", delta);

    // if (state.clock.getElapsedTime() % frameInterval < delta) {
    //   updateCelestialBodyPositions(t, properties);
    // }
    Object.keys(combinedObjects).forEach((name) => {
      const celestialBody = combinedObjects[name] || {};

      if (celestialBody.semimajorAxis10_6Km) {

        // const tSec = (state.clock.getElapsedTime() * useSystemStore.getState().timeSpeed * Math.PI * 2) % (Math.PI * 2);

        const t =
          (((time * Math.PI * 2) /
            yearInSeconds /
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
        const newRotation = new THREE.Euler(
          0,
          (time * (Math.PI * 2) / dayInSeconds / celestialBody.siderealRotationPeriodHrs * objectsRotationSpeed * useSystemStore.getState().timeSpeed) % (Math.PI * 2),
          0
        );

        // Updating the store
        useSolarSystemStore.getState().updateProperty(name, "position", newPosition);
        useSolarSystemStore.getState().updateProperty(name, "rotation", newRotation);

        // console.log("planet name", name, newPosition);
      }
    });

    // make active sun
    // useSystemStore.getState().updateSystemSettings({ activeObjectName: "sun" });
    // }
  });
};
