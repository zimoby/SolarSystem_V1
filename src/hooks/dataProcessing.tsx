import { useEffect, useMemo, useRef } from "react";
import starsData from "../data/starsData.json";
import solarData from "../data/data.json";
import { dayInSeconds, objectsRotationSpeed, planetsNamesOrder, planetsScaleFactor, yearInSeconds } from "../data/solarSystemData";
import { filterObjectData, normalizeDataToEarth } from "../utils/dataProcessing";
import { useSolarSystemStore, useSystemColorsStore, useSystemStore } from "../store/systemStore";
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

  const { uiRandomColors } = useSystemColorsStore.getState();
  const {disableMoons, disableRandomObjects} = useSystemStore.getState();

  const reorderPlanets = planetsNamesOrder.reduce((acc, planetName) => ({
    ...acc,
    [planetName]: solarData[planetName],
  }), {});



  const randomObjects = !disableRandomObjects ? useSolarSystemStore.getState().celestialBodies.objects : {};
  // const randomObjects = !disableRandomObjects ? generateRandomObjects() : {};
  
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

      // console.log("additionalProcessingParams", uiRandomColors);

      additionalProcessingParams['type'] = parentName;
      // additionalProcessingParams['test'] = "some txt"
      additionalProcessingParams['color'] = uiRandomColors[Math.floor(Math.random() * uiRandomColors.length)];
      // additionalProcessingParams['color'] = "red";
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
  const vec3 = new THREE.Vector3();
  const xVec3 = new THREE.Vector3(1, 0, 0);

  const isInitialized = useSystemStore.getState().isInitialized;

  const { timeSpeed, timeOffset, objectsDistance, orbitAngleOffset } = systemState;
  const { planets, moons, objects } = solarSystemState.celestialBodies;
  const {disableMoons, disableRandomObjects} = systemState;

  // console.log("planets", planets, moons, objects);

  // const combinedObjects = {
  //   ...planets,
  //   ...(disableMoons ? {} : moons),
  //   ...(disableRandomObjects ? {} : objects)
  // };

  const combinedObjects = useMemo(() => {
    return {
      ...planets,
      ...(disableMoons ? {} : moons),
      ...(disableRandomObjects ? {} : objects)
    };
  }, [planets, moons, objects, disableMoons, disableRandomObjects]);

  const collectionObjectesVec = useMemo(() => {
    const collection = {};
    Object.keys(combinedObjects).forEach((name) => {
      collection[name] = {
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
      };
    });
    return collection;
  }, [combinedObjects]);

  useFrame((state, delta) => {
  // useFrame(throttle((state, delta) => {
    if (!isInitialized) return;

    // console.log("combinedObjects", combinedObjects);

    const time = state.clock.getElapsedTime();
    const timeSec = time * Math.PI * 2;

    const updatedObjectsData = {};

    Object.keys(combinedObjects).forEach((name, index) => {
      const celestialBody = combinedObjects[name];

      if (!celestialBody || !celestialBody.semimajorAxis10_6Km) return;

      // console.log("name", name,  celestialBody.orbitEccentricity);

      const t = ((timeSec / yearInSeconds / celestialBody.siderealOrbitPeriodDays) * timeSpeed + (timeOffset * (Math.PI * 2)) / 365) % (Math.PI * 2);
      const recalcDistanceX = calculateRelativeDistance(celestialBody.semimajorAxis10_6Km * (1 - celestialBody.orbitEccentricity), objectsDistance);
      const recalcDistanceY = calculateRelativeDistance(celestialBody.semimajorAxis10_6Km * (1 + celestialBody.orbitEccentricity), objectsDistance);
      // const newPosition = new THREE.Vector3(Math.cos(t) * recalcDistanceX, 0, Math.sin(t) * recalcDistanceY);
      // const newPosition = vec3.set(Math.cos(t) * recalcDistanceX, 0, Math.sin(t) * recalcDistanceY);

      const newPosition = collectionObjectesVec[name].position.set(Math.cos(t) * recalcDistanceX, 0, Math.sin(t) * recalcDistanceY);
      
      // quaternionRef.current.setFromAxisAngle(new THREE.Vector3(1, 0, 0), degreesToRadians(celestialBody.orbitInclinationDeg + orbitAngleOffset));
      quaternionRef.current.setFromAxisAngle(xVec3, degreesToRadians(celestialBody.orbitInclinationDeg + orbitAngleOffset));
      newPosition.applyQuaternion(quaternionRef.current);

      const rotationSpeed = (timeSec / dayInSeconds / celestialBody.siderealRotationPeriodHrs * objectsRotationSpeed * timeSpeed) % (Math.PI * 2);
      // const newRotation = new THREE.Euler(0, rotationSpeed , 0);
      const newRotation = collectionObjectesVec[name].rotation.set(0, rotationSpeed, 0);

      updatedObjectsData[name] = { position: newPosition, rotation: newRotation };
    });

    useSolarSystemStore.getState().batchUpdateProperties(updatedObjectsData);
  });
  // }, 40));
};
