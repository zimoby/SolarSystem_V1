import { useEffect, useMemo, useRef } from "react";
import starsData from "../data/starsData.json";
import solarData from "../data/data.json";
import { dayInSeconds, objectsRotationSpeed, planetsNamesOrder, planetsScaleFactor, yearInSeconds } from "../data/solarSystemData";
import { filterObjectData, normalizeDataToEarth } from "../utils/dataProcessing";
import { useSolarSystemStore, useSystemColorsStore, useSystemStore } from "../store/systemStore";
import { useFrame } from "@react-three/fiber";
import { calculateRelativeDistanceXY, calculateTime, degreesToRadians } from "../utils/calculations";
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

      additionalProcessingParams['type'] = parentName;
      additionalProcessingParams['color'] = uiRandomColors[Math.floor(Math.random() * uiRandomColors.length)];
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

  useEffect(() => {

    if (!isInitialized) return;
    const supportData = {};
    Object.keys(combinedObjects).forEach(name => {
      const { semimajorAxis10_6Km, orbitEccentricity, orbitInclinationDeg } = combinedObjects[name];
      supportData[name] = {
        distanceXY: calculateRelativeDistanceXY(semimajorAxis10_6Km, orbitEccentricity, objectsDistance), // Use Vector2 for 2D distances
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

    Object.keys(combinedObjects).forEach(name => {
      const celestialBody = combinedObjects[name];
      const supportData = objectsSupportDataRef.current[name];
      const t = calculateTime(time, celestialBody.siderealOrbitPeriodDays, timeSpeed, timeOffset);

      const position = positionVectorsRef.current[name];
      position.set(
        Math.cos(t) * supportData.distanceXY.x * solarScale,
        0,
        Math.sin(t) * supportData.distanceXY.y * solarScale
      );

      quaternionRef.current.setFromAxisAngle(axisVectorRef.current, supportData.angleRad);
      position.applyQuaternion(quaternionRef.current);

      updatedObjectsData[name] = { position };
    });

    useSolarSystemStore.getState().batchUpdateProperties(updatedObjectsData);
  });

};
