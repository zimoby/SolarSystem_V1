import { useEffect, useMemo, useRef } from "react";
import starsData from "../data/starsData.json";
import solarData from "../data/data.json";
import { moonsDistanceFactor, moonsRotationSpeed, planetsNamesOrder, planetsScaleFactor, starsScaleFactor } from "../data/solarSystemData";
import { filterObjectData, normalizeDataToEarth } from "../utils/dataProcessing";
import { useSolarSystemStore, useSystemColorsStore, useSystemStore } from "../store/systemStore";
import { useFrame } from "@react-three/fiber";
import {
  calculateRelativeDistanceXY,
  calculateRelativeScale,
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
      parentName: string | null = null,
      iter: number
    ): void => {
      const filteredData: SolarObjectParamsBasicT = filterObjectData(data, usedProperties);
      const normalizedData: SolarObjectParamsBasicT = normalizeDataToEarth(
        filteredData,
        ignoreToNormalize
      ); 

      // console.log("asd", {name, iter, type, data, parentName}, celestialBodiesUpdates[type])

      const scaleFactor = type === "stars" ? starsScaleFactor : planetsScaleFactor;
      const distanceFactor = type === "moons" ?
        celestialBodiesUpdates["planets"][parentName].volumetricMeanRadiusKm * 2.5 + 0.011 * (( (iter + 1) / celestialBodiesUpdates["planets"][parentName].moonsAmount )) * moonsDistanceFactor :
        normalizedData?.semimajorAxis10_6Km || 1
      // const distanceFactor = type === "moons" ? (normalizedData?.semimajorAxis10_6Km || 1) * moonsDistanceFactor : normalizedData?.semimajorAxis10_6Km || 1

      // if (type === "moons") {
      //   console.log("asdasdasdas", name,  celestialBodiesUpdates["planets"][parentName].moonsAmount)
      // }

      const additionalProcessingParams: ObjectsAdditionalDataT = {
        ...normalizedData,
        volumetricMeanRadiusKm: (normalizedData?.volumetricMeanRadiusKm || 1) * scaleFactor,
        semimajorAxis10_6Km: distanceFactor,
        type: parentName,
        type2: type,
        moonsAmount: (data as SolarObjectParamsBasicWithMoonsT).moons?.length || 0,
        color: uiRandomColors[Math.floor(Math.random() * uiRandomColors.length)],
      };

      celestialBodiesUpdates[type] = celestialBodiesUpdates[type] || {};
      celestialBodiesUpdates[type][name] = additionalProcessingParams;
      propertiesUpdates[name] = {
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
      };
    };

    Object.keys(reorderPlanets).forEach((planetName, iterPlanet) => {
      const planetData = reorderPlanets[planetName as keyof typeof reorderPlanets];

      if (typeof planetData === "object" && planetData !== null && !Array.isArray(planetData)) {
        if (!disablePlanets) {
          const data = planetData as SolarObjectParamsBasicWithMoonsT;
          processCelestialBody("planets", planetName, data, "sun", iterPlanet);
        }

        if ('moons' in planetData && !disableMoons) {
          const data = planetData as SolarObjectParamsBasicWithMoonsT;
          data.moons?.forEach((moon, iterMoon) => {
            processCelestialBody("moons", moon.name || "", moon, planetName, iterMoon);
          });
        }
      }
    });

    if (randomObjects && !disableRandomObjects) {
      Object.keys(randomObjects).forEach((cosmicObjectName, iterRandom) => {
        return processCelestialBody(
          "objects",
          cosmicObjectName,
          randomObjects[cosmicObjectName] as SolarObjectParamsBasicWithMoonsT,
          "sun",
          iterRandom
        );
      });
    }

    if (trashObjects && !disableTrash) {
      Object.keys(trashObjects).forEach((trashObjectName, iterTrash) => {
        processCelestialBody(
          "trash",
          trashObjectName,
          trashObjects[trashObjectName] as SolarObjectParamsBasicWithMoonsT,
          "sun",
          iterTrash
        );
      });
    }

    const sunData: SolarObjectParamsBasicT = starsData["sun"];
    processCelestialBody("stars", "sun", sunData, "system", 0);

    useSolarSystemStore.getState().batchUpdateCelestialBodies(celestialBodiesUpdates as never);
    useSolarSystemStore.getState().batchUpdateProperties(propertiesUpdates);
    useSystemStore.getState().updateSystemSettings({ dataInitialized: true });

    console.log("end init",celestialBodiesUpdates, propertiesUpdates);

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
  type?: string;
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
    isInitialized2,
    timeSpeed,
    timeOffset,
    objectsDistance,
    objectsRelativeScale,
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

  // useEffect(() => {
  //   console.log("test")
  // }, [])

  useEffect(() => {
    if (!isInitialized) return;

    useSystemStore
      .getState()
      .updateSystemSettings({ maxDistance: maxDistance, minDistance: minDistance });

    const supportData: ObjectsSupportDataT = {};

    Object.keys(combinedObjects).forEach((name) => {
      const { volumetricMeanRadiusKm, semimajorAxis10_6Km, orbitEccentricity, orbitInclinationDeg } = combinedObjects[name];
      // const { semimajorAxis10_6Km, orbitEccentricity, orbitInclinationDeg } = combinedObjects[combinedObjects[name].type];

      // const parentData = combinedObjects[combinedObjects[name].type];
      const parentData = supportData[combinedObjects[name].type as string]
      // console.log("adaq", parentData)

      let moonsDistanceCompensation = 1;
      let moonsDistanceCompensation2 = 1;
      let moonsDistanceCompensation3 = 0;
    
      if (combinedObjects[name].type2 === "moons") {
        moonsDistanceCompensation = objectsDistance;
        moonsDistanceCompensation2 = 1 * parentData.scale
        moonsDistanceCompensation3 = parent.scale;
        console.log("moonsDistanceCompensation", name, moonsDistanceCompensation, moonsDistanceCompensation2, moonsDistanceCompensation3)
      }

      const distanceXY = calculateRelativeDistanceXY(
        (semimajorAxis10_6Km ?? 0.1) * moonsDistanceCompensation2,
        orbitEccentricity ?? 0,
        // objectsDistance ?? 1,
        objectsDistance / moonsDistanceCompensation ?? 1,
        maxDistance ?? 1,
        minDistance ?? 0.3,
        name ?? ""
      );
      const angleRad = degreesToRadians((orbitInclinationDeg ?? 0) + orbitAngleOffset);

      const scale = calculateRelativeScale(
        volumetricMeanRadiusKm ?? 0.1,
        objectsRelativeScale,
        name ?? ""
      )

      supportData[name] = {
        distanceXY,
        angleRad,
        scale,
        type: combinedObjects[name].type2,
      };

      if (!positionVectorsRef.current[name]) {
        positionVectorsRef.current[name] = new THREE.Vector3();
      }
    });

    objectsSupportDataRef.current = supportData;
    useSystemStore.getState().setInitialized2(true);
    useSolarSystemStore.getState().batchUpdateAdditionalProperties(supportData);
    console.log("update supportData", supportData);

  }, [
    isInitialized,
    combinedObjects,
    objectsDistance,
    orbitAngleOffset,
    maxDistance,
    minDistance,
    objectsRelativeScale
  ]);

  // console.log("useCelestialBodyUpdates", isInitialized, isInitialized2);

  useFrame((state) => {
    if (!isInitialized) return;
    if (!isInitialized2) return;

    // console.log("useFrame");

    const time = state.clock.getElapsedTime();
    const updatedObjectsData: Record<string, ObjectsRealtimeDataT> = {};

    // const time = state.clock.getElapsedTime();
    // const timeToFrames = Math.floor(time * 60);
    // if (timeToFrames % 2 === 0) {

    Object.keys(combinedObjects).forEach((name) => {
      const supportData = objectsSupportDataRef.current[name];
      // console.log("supportData", supportData.type);
      const moonsCompenstation = supportData.type === "moons" ? moonsRotationSpeed : 1;
      const t = calculateTime(time, (combinedObjects[name].siderealOrbitPeriodDays || 365) * moonsCompenstation, timeSpeed, timeOffset);

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
