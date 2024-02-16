import { useEffect, useMemo, useRef } from "react";
import starsData from "../data/starsData.json";
import solarData from "../data/data.json";
import { dayInSeconds, objectsRotationSpeed, planetsNamesOrder, planetsScaleFactor, yearInSeconds } from "../data/solarSystemData";
import { filterObjectData, normalizeDataToEarth } from "../utils/dataProcessing";
import { useSolarSystemStore, useSystemColorsStore, useSystemStore } from "../store/systemStore";
import { useFrame } from "@react-three/fiber";
import { calculateDistanceXY, calculateRelativeDistanceXY, calculateTime, degreesToRadians } from "../utils/calculations";
import * as THREE from "three";

// import throttle from "lodash/throttle";

export const useInitiateSolarSystem = () => {
  const usedProperties = [
    "volumetricMeanRadiusKm",
    "semimajorAxis10_6Km",
    "siderealOrbitPeriodDays",
    "orbitInclinationDeg",
    "siderealRotationPeriodHrs",
    "orbitEccentricity",
    "anchorXYOffset",
    "planetaryRingSystem"
  ];

  const ignoreToNormalize = ["orbitEccentricity"];

  const { uiRandomColors } = useSystemColorsStore.getState();
  const { isInitialized, disablePlanets, disableMoons, disableRandomObjects, disableTrash } = useSystemStore.getState();

  const reorderPlanets = planetsNamesOrder.reduce((acc, planetName) => ({
    ...acc,
    [planetName]: solarData[planetName],
  }), {});



  const randomObjects = !disableRandomObjects ? useSolarSystemStore.getState().celestialBodies.objects : {};
  const trashObjects = !disableTrash ? useSolarSystemStore.getState().celestialBodies.trash : {};
  // const randomObjects = !disableRandomObjects ? generateRandomObjects() : {};
  
  useEffect(() => {

    if (isInitialized) {return;}

    console.log("start init");
    const celestialBodiesUpdates = {};
    const propertiesUpdates = {};
    

    const processCelestialBody = (type, name, data, parentName = null) => {
      const filteredData = filterObjectData(data, usedProperties);
      const normalizedData = normalizeDataToEarth(filteredData, ignoreToNormalize);
      const additionalProcessingParams = {
        ...normalizedData,
        volumetricMeanRadiusKm: (normalizedData?.volumetricMeanRadiusKm || 1) * planetsScaleFactor,
      };

      celestialBodiesUpdates[type] = celestialBodiesUpdates[type] || {};
      celestialBodiesUpdates[type][name] = additionalProcessingParams;
      propertiesUpdates[name] = {
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
      };

      additionalProcessingParams['type'] = parentName;
      additionalProcessingParams['color'] = uiRandomColors[(Math.random() * uiRandomColors.length) - 0.1];
      // additionalProcessingParams['color'] = uiRandomColors[Math.floor(Math.random() * uiRandomColors.length) - 0.1];
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

    });

    if (randomObjects && !disableRandomObjects) {
      Object.keys(randomObjects).forEach((cosmicObjectName) => {
        processCelestialBody("objects", cosmicObjectName, randomObjects[cosmicObjectName]);
      });
    }

    if (trashObjects && !disableTrash) {
      Object.keys(trashObjects).forEach((trashObjectName) => {
        processCelestialBody("trash", trashObjectName, trashObjects[trashObjectName]);
      });
    }

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
  const positionVectorsRef = useRef({});
  const axisVectorRef = useRef(new THREE.Vector3(1, 0, 0));
  const quaternionRef = useRef(new THREE.Quaternion());
  const objectsSupportDataRef = useRef({});



  const { isInitialized, isInitialized2, timeSpeed, timeOffset, solarScale, objectsDistance, orbitAngleOffset } = useSystemStore.getState();
  const { planets, moons, objects } = useSolarSystemStore.getState().celestialBodies;

  // console.log("useCelestialBodyUpdates", isInitialized);

  const combinedObjects = useMemo(() => {

    if (!isInitialized) return {};
    // console.log("combinedObjects", planets, moons, objects);
    return {
      ...planets,
      ...moons,
      ...objects
    };
  }, [isInitialized, planets, moons, objects]);

  const [maxDistance, minDistance] = useMemo(() => {
    if (!isInitialized) return [0, 1];
    const distances = Object.keys(combinedObjects).reduce((acc, name) => {
      const { semimajorAxis10_6Km, orbitEccentricity } = combinedObjects[name];

      const distanceX = semimajorAxis10_6Km * (1 - orbitEccentricity);
      const distanceY = semimajorAxis10_6Km * (1 + orbitEccentricity);

      return {
        maxDistance: Math.max(distanceX, distanceY, acc.maxDistance),
        minDistance: Math.min(distanceX, distanceY, acc.minDistance),
      };
    }, { maxDistance: 0, minDistance: 1 });

    return [distances.maxDistance, distances.minDistance];
  }, [isInitialized, combinedObjects]);



  // console.log("farrestObject", farrestObject);


  useEffect(() => {
    if (!isInitialized) return;

      useSystemStore.getState().updateSystemSettings({ maxDistance: maxDistance, minDistance: minDistance });


    const supportData = {};
    Object.keys(combinedObjects).forEach(name => {
      const { semimajorAxis10_6Km, orbitEccentricity, orbitInclinationDeg } = combinedObjects[name];
      supportData[name] = {
        distanceXY: calculateRelativeDistanceXY(semimajorAxis10_6Km, orbitEccentricity, objectsDistance, maxDistance, minDistance, name), // Use Vector2 for 2D distances
        angleRad: degreesToRadians(orbitInclinationDeg + orbitAngleOffset),
      };

      if (!positionVectorsRef.current[name]) {
        positionVectorsRef.current[name] = new THREE.Vector3();
      }

    });
    objectsSupportDataRef.current = supportData;
    useSystemStore.getState().setInitialized2(true);
    useSolarSystemStore.getState().batchUpdateAdditionalProperties(supportData);
    console.log("update supportData", supportData);
  }, [isInitialized, combinedObjects, objectsDistance, orbitAngleOffset]);

  useFrame((state) => {
    if (!isInitialized) return;

    const time = state.clock.getElapsedTime();
    const updatedObjectsData = {};

    // const time = state.clock.getElapsedTime();
    // const timeToFrames = Math.floor(time * 60);
    // if (timeToFrames % 2 === 0) {

    Object.keys(combinedObjects).forEach(name => {
      const celestialBody = combinedObjects[name];
      const supportData = objectsSupportDataRef.current[name];
      const t = calculateTime(time, celestialBody.siderealOrbitPeriodDays, timeSpeed, timeOffset);

      const position = positionVectorsRef.current[name];
      position.set(
        Math.cos(t) * supportData.distanceXY.x,
        0,
        Math.sin(t) * supportData.distanceXY.y
      );

      quaternionRef.current.setFromAxisAngle(axisVectorRef.current, supportData.angleRad);
      position.applyQuaternion(quaternionRef.current);

      updatedObjectsData[name] = { position };
    });

    useSolarSystemStore.getState().batchUpdateProperties(updatedObjectsData);

  // }
  });

};
