import { useEffect, useMemo, useRef } from "react";
import starsData from "../data/starsData.json";
import solarData from "../data/data.json";
import { dayInSeconds, objectsRotationSpeed, planetsNamesOrder, planetsScaleFactor, yearInSeconds } from "../data/solarSystemData";
import { filterObjectData, normalizeDataToEarth } from "../utils/dataProcessing";
import { useSolarSystemStore, useSystemStore } from "../store/systemStore";
import { useFrame } from "@react-three/fiber";
import { calculateRelativeDistance, degreesToRadians } from "../utils/calculations";
import * as THREE from "three";
import { cosmicObjectsData } from "../data/cosmicObjects";

import throttle from "lodash/throttle";

export const useInitiateSolarSystem = () => {
  const usedProperties = [
    "volumetricMeanRadiusKm",
    "semimajorAxis10_6Km",
    "siderealOrbitPeriodDays",
    "orbitInclinationDeg",
    "siderealRotationPeriodHrs",
    "orbitEccentricity"
  ];

  const ignoreToNormalize = ["orbitEccentricity"];

  const {disableMoons, disableRandomObjects} = useSystemStore.getState();

  const reorderPlanets = planetsNamesOrder.reduce((acc, planetName) => ({
    ...acc,
    [planetName]: solarData[planetName],
  }), {});

  const generateRandomObjects = () => {
    const randomObjects = {};
    for (let i = 0; i < 30; i++) {
      randomObjects[`object${i}`] = {
        volumetricMeanRadiusKm: 100,
        semimajorAxis10_6Km: Math.random() * 4000,
        siderealOrbitPeriodDays: (Math.random() * 1000) + 400,
        orbitInclinationDeg: Math.random() * 360,
        siderealRotationPeriodHrs: 0,
        orbitEccentricity: Math.random(),
      };
    }
    return randomObjects;
  }

  const randomObjects = !disableRandomObjects ? generateRandomObjects() : {};
  
  useEffect(() => {
    console.log("start init");
    const celestialBodiesUpdates = {};
    const propertiesUpdates = {};

    const processCelestialBody = (type, name, data, parentName = null) => {
      const filteredData = filterObjectData(data, usedProperties);
      const normalizedData = normalizeDataToEarth(filteredData, ignoreToNormalize);
      const additionalProcessingParams = {
        ...normalizedData,
        volumetricMeanRadiusKm: normalizedData.volumetricMeanRadiusKm / planetsScaleFactor,
      };

      celestialBodiesUpdates[type] = celestialBodiesUpdates[type] || {};
      celestialBodiesUpdates[type][name] = additionalProcessingParams;
      propertiesUpdates[name] = {
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
      };

      additionalProcessingParams['type'] = parentName;
    };

    Object.keys(reorderPlanets).forEach((planetName) => {
      const planetData = reorderPlanets[planetName];
      processCelestialBody("planets", planetName, planetData, "sun");

      if (planetData.moons && !disableMoons) {
        planetData.moons.forEach((moon) => {
          processCelestialBody("moons", moon.name, moon, planetName);
        });
      }

      if (randomObjects && !disableRandomObjects) {
        Object.keys(randomObjects).forEach((cosmicObjectName) => {
          processCelestialBody("objects", cosmicObjectName, randomObjects[cosmicObjectName]);
        });
      }
    });

    const sunData = starsData["sun"];
    processCelestialBody("stars", "sun", sunData);

    useSolarSystemStore.getState().batchUpdateCelestialBodies(celestialBodiesUpdates);
    useSolarSystemStore.getState().batchUpdateProperties(propertiesUpdates);
    useSystemStore.getState().updateSystemSettings({ dataInitialized: true });

    console.log("end init", propertiesUpdates);

    useSystemStore.getState().setInitialized(true);
  }, []);
};

export const useCelestialBodyUpdates = () => {

  const systemState = useSystemStore.getState();
  const solarSystemState = useSolarSystemStore.getState();
  const quaternionRef = useRef(new THREE.Quaternion());

  const isInitialized = useSystemStore.getState().isInitialized;

  const { timeSpeed, timeOffset, objectsDistance, orbitAngleOffset } = systemState;
  const { planets, moons, objects } = solarSystemState.celestialBodies;
  const {disableMoons, disableRandomObjects} = systemState;

  const combinedObjects = {
    ...planets,
    ...(disableMoons ? {} : moons),
    ...(disableRandomObjects ? {} : objects)
  };

  useFrame((state, delta) => {
  // useFrame(throttle((state, delta) => {
    if (!isInitialized) return;

    // console.log("combinedObjects", combinedObjects);

    const time = state.clock.getElapsedTime();
    const timeSec = time * Math.PI * 2;

    const updatedObjectsData = {};

    Object.keys(combinedObjects).forEach((name) => {
      const celestialBody = combinedObjects[name];

      if (!celestialBody || !celestialBody.semimajorAxis10_6Km) return;

      // console.log("name", name,  celestialBody.orbitEccentricity);

      const t = ((timeSec / yearInSeconds / celestialBody.siderealOrbitPeriodDays) * timeSpeed + (timeOffset * (Math.PI * 2)) / 365) % (Math.PI * 2);
      const recalcDistanceX = calculateRelativeDistance(celestialBody.semimajorAxis10_6Km * (1 - celestialBody.orbitEccentricity), objectsDistance);
      const recalcDistanceY = calculateRelativeDistance(celestialBody.semimajorAxis10_6Km * (1 + celestialBody.orbitEccentricity), objectsDistance);
      const newPosition = new THREE.Vector3(Math.cos(t) * recalcDistanceX, 0, Math.sin(t) * recalcDistanceY);
      quaternionRef.current.setFromAxisAngle(new THREE.Vector3(1, 0, 0), degreesToRadians(celestialBody.orbitInclinationDeg + orbitAngleOffset));
      newPosition.applyQuaternion(quaternionRef.current);

      const rotationSpeed = (timeSec / dayInSeconds / celestialBody.siderealRotationPeriodHrs * objectsRotationSpeed * timeSpeed) % (Math.PI * 2);
      const newRotation = new THREE.Euler(0, rotationSpeed , 0);

      updatedObjectsData[name] = { position: newPosition, rotation: newRotation };
    });

    useSolarSystemStore.getState().batchUpdateProperties(updatedObjectsData);
  });
  // }, 40));
};
