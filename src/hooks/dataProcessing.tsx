import { useEffect, useMemo, useRef } from "react";
import starsData from "../data/starsData.json";
import solarData from "../data/data.json";
import { planetsNamesOrder, planetsScaleFactor } from "../data/solarSystemData";
import { filterObjectData, normalizeDataToEarth } from "../utils/dataProcessing";
import { useSolarSystemStore, useSystemColorsStore, useSystemStore } from "../store/systemStore";
import { useFrame } from "@react-three/fiber";
import {
  calculateRelativeDistanceXY,
  calculateTime,
  degreesToRadians,
} from "../utils/calculations";
import * as THREE from "three";
import {
  CelestialBodyType,
  ObjectsAdditionalDataT,
  ObjectsRealtimeDataT,
  SolarObjectParamsBasicT,
  SolarObjectParamsBasicWithMoonsT,
} from "../types";

export const useInitiateSolarSystem = () => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const usedProperties: string[] = [
    "volumetricMeanRadiusKm",
    "semimajorAxis10_6Km",
    "siderealOrbitPeriodDays",
    "orbitInclinationDeg",
    "siderealRotationPeriodHrs",
    "orbitEccentricity",
    "anchorXYOffset",
    "planetaryRingSystem",
  ];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ignoreToNormalize: string[] = ["orbitEccentricity"];

  const { uiRandomColors } = useSystemColorsStore.getState();
  const { isInitialized, disablePlanets, disableMoons, disableRandomObjects, disableTrash } =
    useSystemStore.getState();

  const reorderPlanets: SolarObjectParamsBasicWithMoonsT = planetsNamesOrder.reduce(
    (acc, planetName) => ({
      ...acc,
      [planetName]: solarData[planetName],
    }),
    {} as SolarObjectParamsBasicWithMoonsT
  );

  const randomObjects: Record<string, SolarObjectParamsBasicT> = useMemo(() => {
    return !disableRandomObjects ? useSolarSystemStore.getState().celestialBodies.objects : {};
  }, [disableRandomObjects]);

  const trashObjects: Record<string, SolarObjectParamsBasicT> = useMemo(() => {
    return !disableTrash ? useSolarSystemStore.getState().celestialBodies.trash : {};
  }, [disableTrash]);

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    console.log("start init");

    const celestialBodiesUpdates: Record<
      CelestialBodyType,
      Record<string, ObjectsAdditionalDataT>
    > = {} as Record<CelestialBodyType, Record<string, ObjectsAdditionalDataT>>;
    const propertiesUpdates: Record<string, ObjectsRealtimeDataT> = {};

    const processCelestialBody = (
      type: CelestialBodyType,
      name: string,
      data: SolarObjectParamsBasicWithMoonsT | SolarObjectParamsBasicT,
      parentName: string | null = null
    ): void => {
      const filteredData: SolarObjectParamsBasicT = filterObjectData(data, usedProperties);
      const normalizedData: SolarObjectParamsBasicT = normalizeDataToEarth(
        filteredData,
        ignoreToNormalize
      ); 
      const additionalProcessingParams: ObjectsAdditionalDataT = {
        ...normalizedData,
        volumetricMeanRadiusKm: (normalizedData?.volumetricMeanRadiusKm || 1) * planetsScaleFactor,
        type: parentName,
        color: uiRandomColors[Math.floor(Math.random() * uiRandomColors.length)],
      };

      celestialBodiesUpdates[type] = celestialBodiesUpdates[type] || {};
      celestialBodiesUpdates[type][name] = additionalProcessingParams;
      propertiesUpdates[name] = {
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
      };
    };

    Object.keys(reorderPlanets).forEach((planetName) => {
      const planetData = reorderPlanets[planetName as keyof typeof reorderPlanets];

      if (typeof planetData === "object" && planetData !== null && !Array.isArray(planetData)) {
        if (!disablePlanets) {
          const data = planetData as SolarObjectParamsBasicWithMoonsT;
          processCelestialBody("planets", planetName, data, "sun");
        }

        if ('moons' in planetData && !disableMoons) {
          Object.entries(planetData.moons!).forEach(([moonName, moonData]) => {
            processCelestialBody("moons", moonName, moonData as SolarObjectParamsBasicT, planetName);
          });
        }
      } else {
        console.warn(`Planet data for '${planetName}' is not a valid object.`);
      }
    });

    if (randomObjects && !disableRandomObjects) {
      Object.keys(randomObjects).forEach((cosmicObjectName) => {
        return processCelestialBody(
          "objects",
          cosmicObjectName,
          randomObjects[cosmicObjectName] as SolarObjectParamsBasicWithMoonsT
        );
      });
    }

    if (trashObjects && !disableTrash) {
      Object.keys(trashObjects).forEach((trashObjectName) => {
        processCelestialBody(
          "trash",
          trashObjectName,
          trashObjects[trashObjectName] as SolarObjectParamsBasicWithMoonsT
        );
      });
    }

    const sunData: SolarObjectParamsBasicT = starsData["sun"];
    processCelestialBody("stars", "sun", sunData);

    useSolarSystemStore.getState().batchUpdateCelestialBodies(celestialBodiesUpdates as never);
    useSolarSystemStore.getState().batchUpdateProperties(propertiesUpdates);
    useSystemStore.getState().updateSystemSettings({ dataInitialized: true });

    console.log("end init", propertiesUpdates);

    useSystemStore.getState().setInitialized(true);
  }, [
    disableMoons,
    disablePlanets,
    disableRandomObjects,
    disableTrash,
    ignoreToNormalize,
    isInitialized,
    randomObjects,
    reorderPlanets,
    trashObjects,
    uiRandomColors,
    usedProperties,
  ]);
};

interface SupportDataT {
  distanceXY: {
    x: number;
    y: number;
  };
  angleRad: number;
}

interface ObjectsSupportDataT {
  [key: string]: SupportDataT;
}

interface PositionVectorsT {
  [key: string]: THREE.Vector3;
}

export const useCelestialBodyUpdates = () => {
  const positionVectorsRef = useRef<PositionVectorsT>({});
  const axisVectorRef = useRef(new THREE.Vector3(1, 0, 0));
  const quaternionRef = useRef(new THREE.Quaternion());
  const objectsSupportDataRef = useRef<ObjectsSupportDataT>({});

  const {
    isInitialized,
    timeSpeed,
    timeOffset,
    objectsDistance,
    orbitAngleOffset,
  } = useSystemStore.getState();
  const { planets, moons, objects } = useSolarSystemStore.getState().celestialBodies;

  const combinedObjects = useMemo(() => {
    if (!isInitialized) return {};
    return {
      ...planets,
      ...moons,
      ...objects,
    };
  }, [isInitialized, planets, moons, objects]);

  const [maxDistance, minDistance] = useMemo(() => {
    if (!isInitialized) return [0, 1];
    const distances = Object.keys(combinedObjects).reduce(
      (acc, name) => {
        const { semimajorAxis10_6Km, orbitEccentricity } = combinedObjects[name];

        if (semimajorAxis10_6Km !== undefined && orbitEccentricity !== undefined) {
          const distanceX = semimajorAxis10_6Km * (1 - orbitEccentricity);
          const distanceY = semimajorAxis10_6Km * (1 + orbitEccentricity);

          return {
            maxDistance: Math.max(distanceX, distanceY, acc.maxDistance),
            minDistance: Math.min(distanceX, distanceY, acc.minDistance),
          };
        }

        return acc;
      },
      { maxDistance: 0, minDistance: 1 }
    );

    return [distances.maxDistance, distances.minDistance];
  }, [isInitialized, combinedObjects]);

  useEffect(() => {
    if (!isInitialized) return;

    useSystemStore
      .getState()
      .updateSystemSettings({ maxDistance: maxDistance, minDistance: minDistance });

    const supportData: ObjectsSupportDataT = {};

    Object.keys(combinedObjects).forEach((name) => {
      const { semimajorAxis10_6Km, orbitEccentricity, orbitInclinationDeg } = combinedObjects[name];

      const distanceXY = calculateRelativeDistanceXY(
        semimajorAxis10_6Km || 0,
        orbitEccentricity || 0,
        objectsDistance || 1,
        maxDistance || 1,
        minDistance || 0.3,
        name || ""
      );
      const angleRad = degreesToRadians((orbitInclinationDeg ?? 0) + orbitAngleOffset);

      supportData[name] = {
        distanceXY,
        angleRad,
      };

      if (!positionVectorsRef.current[name]) {
        positionVectorsRef.current[name] = new THREE.Vector3();
      }
    });

    objectsSupportDataRef.current = supportData;
    useSystemStore.getState().setInitialized2(true);
    useSolarSystemStore.getState().batchUpdateAdditionalProperties(supportData);

    console.log("update supportData", supportData);
  }, [isInitialized, combinedObjects, objectsDistance, orbitAngleOffset, maxDistance, minDistance]);

  useFrame((state) => {
    if (!isInitialized) return;

    const time = state.clock.getElapsedTime();
    const updatedObjectsData: Record<string, ObjectsRealtimeDataT> = {};

    // const time = state.clock.getElapsedTime();
    // const timeToFrames = Math.floor(time * 60);
    // if (timeToFrames % 2 === 0) {

    Object.keys(combinedObjects).forEach((name) => {
      const supportData = objectsSupportDataRef.current[name];
      const t = calculateTime(time, combinedObjects[name].siderealOrbitPeriodDays || 365, timeSpeed, timeOffset);

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
