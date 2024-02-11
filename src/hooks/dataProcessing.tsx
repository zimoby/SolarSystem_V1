import { useEffect, useMemo, useRef } from "react";
import starsData from "../data/starsData.json";
import solarData from "../data/data.json";
import { dayInSeconds, objectsRotationSpeed, planetsNamesOrder, planetsScaleFactor, yearInSeconds } from "../data/solarSystemData";
import { filterObjectData, normalizeDataToEarth } from "../utils/dataProcessing";
import { useSolarSystemStore, useSystemColorsStore, useSystemStore } from "../store/systemStore";
import { useFrame } from "@react-three/fiber";
import { calculateRelativeDistanceXY, calculateTime, degreesToRadians } from "../utils/calculations";
import * as THREE from "three";

import throttle from "lodash/throttle";

export const useInitiateSolarSystem = () => {
  const usedProperties = [
    "volumetricMeanRadiusKm",
    "semimajorAxis10_6Km",
    "siderealOrbitPeriodDays",
    "orbitInclinationDeg",
    "siderealRotationPeriodHrs",
    "orbitEccentricity",
    "anchorXYOffset"
  ];

  const ignoreToNormalize = ["orbitEccentricity"];

  const { uiRandomColors } = useSystemColorsStore.getState();
  const {disablePlanets, disableMoons, disableRandomObjects} = useSystemStore.getState();

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

      // const {
      //   x: planetDistanceX,
      //   y: planetDistanceY
      // } = calculateRelativeDistanceXY(
      //   additionalProcessingParams.semimajorAxis10_6Km,
      //   additionalProcessingParams.orbitEccentricity,
      //   useSystemStore.getState().objectsDistance);

      // additionalProcessingParams['orbit'] = new THREE.EllipseCurve(0, 0, planetDistanceX, planetDistanceY, 0, Math.PI * 2, false).getPoints(64);
    };

    Object.keys(reorderPlanets).forEach((planetName) => {
      const planetData = reorderPlanets[planetName];

      if (!disablePlanets) {
        processCelestialBody("planets", planetName, planetData, "sun");
      }

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

  const quaternionRef = useRef(new THREE.Quaternion());
  const xVec3 = new THREE.Vector3(1, 0, 0);

  const isInitialized = useSystemStore.getState().isInitialized;
  const testData = useSolarSystemStore.getState().additionalProperties;

  const { solarScale, timeSpeed, timeOffset, objectsDistance, orbitAngleOffset } = useSystemStore.getState();
  const { planets, moons, objects } = useSolarSystemStore.getState().celestialBodies;

  // console.log("planets", planets, moons, objects);

  // const combinedObjects = {
  //   ...planets,
  //   ...(disableMoons ? {} : moons),
  //   ...(disableRandomObjects ? {} : objects)
  // };

  const combinedObjects = useMemo(() => {
    return {
      ...planets,
      ...moons,
      ...objects
    };
  }, [planets, moons, objects]);

  // console.log("combinedObjects", combinedObjects);

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

  const objectsSupportData = useMemo(() => {
    const collection = {};
    Object.keys(combinedObjects).forEach((name) => {
      const celestialBody = combinedObjects[name];

      const {
        x: recalcDistanceX,
        y: recalcDistanceY
      } = calculateRelativeDistanceXY(celestialBody.semimajorAxis10_6Km, celestialBody.orbitEccentricity, objectsDistance);

      collection[name] = {
        distanceXY : { x: recalcDistanceX, y: recalcDistanceY },
        angleRad: degreesToRadians(celestialBody.orbitInclinationDeg + orbitAngleOffset)
      };
    });

    // useSolarSystemStore.getState().batchUpdateAdditionalProperties(collection);
    // console.log("objectsSupportData", collection);
    return collection;
  }, [combinedObjects, objectsDistance, orbitAngleOffset]);

  // useEffect(() => {
    // console.log("objectsSupportData", objectsSupportData);
    // useSolarSystemStore.getState().batchUpdateAdditionalProperties(objectsSupportData);
  // }, [objectsSupportData]);

  // useEffect(() => {
  //   console.log("testData", testData);
  // }, [testData]);


  useFrame((state) => {
  // useFrame(throttle((state, delta) => {
    if (!isInitialized) return;

    // console.log("combinedObjects", combinedObjects);

    const time = state.clock.getElapsedTime();

    const updatedObjectsData = {};

    Object.keys(combinedObjects).forEach((name, index) => {
      const celestialBody = combinedObjects[name];
      const supportData = objectsSupportData[name];

      if (!celestialBody || !celestialBody.semimajorAxis10_6Km) return;

      // console.log("name", name,  celestialBody.orbitEccentricity);

      const t = calculateTime(time, celestialBody.siderealOrbitPeriodDays);

      // (celestialBody.anchorXYOffset?.y ?? 0)
      
      const newPosition = collectionObjectesVec[name].position.set(
        Math.cos(t) * supportData.distanceXY.x * solarScale,
        0,
        Math.sin(t) * supportData.distanceXY.y * solarScale
      );

      quaternionRef.current.setFromAxisAngle(xVec3, supportData.angleRad);
      newPosition.applyQuaternion(quaternionRef.current);

      updatedObjectsData[name] = { position: newPosition };
    });

    useSolarSystemStore.getState().batchUpdateProperties(updatedObjectsData);
  });
  // }, 40));
};
