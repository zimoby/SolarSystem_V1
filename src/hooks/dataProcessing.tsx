import { useEffect, useMemo, useRef } from "react";
import starsData from "../data/starsData.json";
import solarData from "../data/data.json";
import {
  moonsDistanceFactor,
  moonsRotationSpeed,
  planetsNamesOrder,
  planetsScaleFactor,
  starsScaleFactor,
} from "../data/solarSystemData";
import { filterObjectData, normalizeDataToEarth } from "../utils/dataProcessing";
import { useSolarStore, useSolarPositionsStore } from "../store/systemStore";
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
  ObjectsSupportDataT,
  PositionVectorsT,
  SolarObjectParamsBasicT,
  SolarObjectParamsBasicWithMoonsT,
} from "../types";
import { generateCrossingObjects, generateTrash } from "../utils/generators";

const usedProperties: string[] = [
  "volumetricMeanRadiusKm",
  "semimajorAxis10_6Km",
  "siderealOrbitPeriodDays",
  "orbitInclinationDeg",
  "siderealRotationPeriodHrs",
  "orbitEccentricity",
  "anchorXYOffset",
  "planetaryRingSystem",
  "obliquityToOrbitDeg",
];

const ignoreToNormalize: string[] = ["orbitEccentricity", "obliquityToOrbitDeg", "anchorXYOffset"];

const reorderPlanets: SolarObjectParamsBasicWithMoonsT = planetsNamesOrder.reduce(
  (acc, planetName) => ({
    ...acc,
    [planetName]: solarData[planetName],
  }),
  {} as SolarObjectParamsBasicWithMoonsT
);

const sunData: SolarObjectParamsBasicT = starsData["sun"];

export const useInitiateSolarSystem = () => {
  const uiRandomColors = useSolarStore((state) => state.uiRandomColors);
  const isInitialized = useSolarStore((state) => state.isInitialized);
  const disableMoons = useSolarStore((state) => state.disableMoons);
  const disablePlanets = useSolarStore((state) => state.disablePlanets);
  const disableRandomObjects = useSolarStore((state) => state.disableRandomObjects);
  const disableTrash = useSolarStore((state) => state.disableTrash);

  const DEV_MODE = useSolarStore((state) => state.DEV_MODE);

  const objects = useSolarStore((state) => state.celestialBodies.objects);
  const trash = useSolarStore((state) => state.celestialBodies.trash);

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    const randomObjects: Record<string, SolarObjectParamsBasicT> = !disableRandomObjects ? objects : {};
    const trashObjects: Record<string, SolarObjectParamsBasicT> = !disableTrash ? trash : {};
  
    useSolarStore.getState().updateSystemSettings({
      // @ts-expect-error tired of typing
      activeObjectInfo: {
        sun: sunData,
      ...reorderPlanets,
      ...randomObjects
    }});

    DEV_MODE && console.log("start init");

    const celestialBodiesUpdates: Record<
      CelestialBodyType,
      Record<string, ObjectsAdditionalDataT>
    > = {} as Record<CelestialBodyType, Record<string, ObjectsAdditionalDataT>>;
    const propertiesUpdates: Record<string, ObjectsRealtimeDataT> = {};

    const processCelestialBody = (
      type: CelestialBodyType,
      name: string,
      data: SolarObjectParamsBasicWithMoonsT | SolarObjectParamsBasicT,
      parentName: string = "",
      iter: number
    ): void => {

      const filteredData: SolarObjectParamsBasicT = filterObjectData(data, usedProperties)
      const normalizedData: SolarObjectParamsBasicT = normalizeDataToEarth(filteredData, ignoreToNormalize)

      const parentVolumetricMeanRadiusKm = type === "moons" ? celestialBodiesUpdates["planets"][parentName]?.volumetricMeanRadiusKm ?? 1 : 1;
      const parentMoonsAmount = type === "moons" ? celestialBodiesUpdates["planets"][parentName].moonsAmount ?? 1 : 1;
      const relativeMoonsDistance = parentVolumetricMeanRadiusKm * 2.5 + 0.011 * ((iter + 1) / parentMoonsAmount) * moonsDistanceFactor;

      const moonsAmount = (data as SolarObjectParamsBasicWithMoonsT).moons?.length || 0;

      const scaleFactor = type === "stars" ? starsScaleFactor : planetsScaleFactor
      const relativeVolumetricMeanRadiusKm = (normalizedData?.volumetricMeanRadiusKm || 1) * scaleFactor;
      const distanceFactor = type === "moons" ? relativeMoonsDistance : normalizedData?.semimajorAxis10_6Km || 1
      
      const randomColor = uiRandomColors[Math.floor(Math.random() * uiRandomColors.length)]

      const additionalProcessingParams: ObjectsAdditionalDataT = {
        ...normalizedData,
        volumetricMeanRadiusKm: relativeVolumetricMeanRadiusKm,
        semimajorAxis10_6Km: distanceFactor,
        type: parentName,
        type2: type,
        moonsAmount: moonsAmount,
        color: randomColor,
        rotationOffset: Math.random() * Math.PI * 2,
        rotationY: (type === "objects") ? Math.random() * Math.PI * 2 : 0
      }

      celestialBodiesUpdates[type] = celestialBodiesUpdates[type] || {};
      celestialBodiesUpdates[type][name] = additionalProcessingParams;
      propertiesUpdates[name] = {
        position: new THREE.Vector3(0, 0, 0),
      };
    };

    Object.keys(reorderPlanets).forEach((planetName, iterPlanet) => {
      const planetData = reorderPlanets[planetName as keyof typeof reorderPlanets];

      if (typeof planetData === "object" && planetData !== null && !Array.isArray(planetData)) {
        if (!disablePlanets) {
          const data = planetData as SolarObjectParamsBasicWithMoonsT;
          processCelestialBody("planets", planetName, data, "sun", iterPlanet);
        }

        if ("moons" in planetData && !disableMoons) {
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

    processCelestialBody("stars", "sun", sunData, "system", 0);

    useSolarStore.getState().batchUpdateCelestialBodies(celestialBodiesUpdates as never);
    useSolarPositionsStore.getState().batchUpdateProperties(propertiesUpdates);
    useSolarStore.getState().updateSystemSettings({ dataInitialized: true });

    DEV_MODE && console.log("end init", celestialBodiesUpdates, propertiesUpdates);

    useSolarStore.getState().setInitialized(true);
  }, [DEV_MODE, disableMoons, disablePlanets, disableRandomObjects, disableTrash, isInitialized, objects, trash, uiRandomColors]);
};

export const useCelestialBodyUpdates = () => {
  const DEV_MODE = useSolarStore((state) => state.DEV_MODE);
  
  const positionVectorsRef = useRef<PositionVectorsT>({});
  const objectsSupportDataRef = useRef<ObjectsSupportDataT>({});
  const quaternionRef = useRef(new THREE.Quaternion());

  const isInitialized = useSolarStore((state) => state.isInitialized);
  const isInitialized2 = useSolarStore((state) => state.isInitialized2);
  // const randomObjectsInitialized = useSolarStore((state) => state.randomObjectsInitialized);
  const updateSystemSettings = useSolarStore((state) => state.updateSystemSettings);
  
  const timeSpeed = useSolarStore((state) => state.timeSpeed);
  const timeOffset = useSolarStore((state) => state.timeOffset);
  const objectsDistance = useSolarStore((state) => state.objectsDistance);
  const objectsRelativeScale = useSolarStore((state) => state.objectsRelativeScale);
  const orbitAngleOffset = useSolarStore((state) => state.orbitAngleOffset);

  const planets = useSolarStore((state) => state.celestialBodies.planets);
  const moons = useSolarStore((state) => state.celestialBodies.moons);
  const objects = useSolarStore((state) => state.celestialBodies.objects);

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

    useSolarStore.getState().updateSystemSettings({
      maxDistance: maxDistance,
      minDistance: minDistance,
    });

    const supportData: ObjectsSupportDataT = {};

    Object.keys(combinedObjects).forEach((name) => {
      const {
        volumetricMeanRadiusKm,
        semimajorAxis10_6Km,
        orbitEccentricity,
        orbitInclinationDeg,
      } = combinedObjects[name];

      const parentData = supportData[combinedObjects[name].type as string];

      let moonsDistanceCompensation = 1;
      let moonsDistanceCompensation2 = 1;

      if (combinedObjects[name].type2 === "moons") {
        moonsDistanceCompensation = objectsDistance;
        moonsDistanceCompensation2 = 1 * parentData.scale;
      }

      const distanceXY = calculateRelativeDistanceXY(
        (semimajorAxis10_6Km ?? 0.1) * moonsDistanceCompensation2,
        orbitEccentricity ?? 0,
        objectsDistance / moonsDistanceCompensation,
        maxDistance ?? 1,
        minDistance ?? 0.3,
        name ?? ""
      );

      // console.log("distanceXY", name, distanceXY);

      const angleRad = degreesToRadians((orbitInclinationDeg ?? 0) + orbitAngleOffset);
      // const objectsRelativeScale = useSolarStore((state) => state.objectsRelativeScale);

      const scale = combinedObjects[name].type2 !== "moons" ?
        calculateRelativeScale(
          volumetricMeanRadiusKm ?? 0.1,
          objectsRelativeScale,
          name ?? ""
        ) : volumetricMeanRadiusKm;

      // const rotationY = (combinedObjects[name].type2 === "objects") ? Math.random() * Math.PI * 2 : 0;
      // const rotationOffset = Math.random() * Math.PI * 2;

      supportData[name] = {
        distanceXY,
        angleRad,
        scale,
        // rotationY,
        // rotationOffset,
        type: combinedObjects[name].type2,
      };

      if (!positionVectorsRef.current[name]) {
        positionVectorsRef.current[name] = new THREE.Vector3();
      }
    });

    // const trashInner1 = generateTrash(1000,        1, 0.25 / objectsDistance, 1, "inner circle");
    // const trashInner2 = generateTrash(1000,        1, 0.25 / objectsDistance, 1, "inner circle", 2);
    // const trashMiddle1 = generateTrash(1000,      1 , 0.6 / objectsDistance, 1, "middle circle");
    // const trashMiddle2 = generateTrash(1000 / 50, 1 , 0.6 / objectsDistance, 1, "middle circle");
    // const trashOuter1 = generateTrash(4000,        1, 0.05 / objectsDistance, 1, "outer circle");
    // const trashCross = generateCrossingObjects(100, [10, 10, 3]);

    // useSolarStore.getState().batchUpdateCelestialBodies({
    //   trashCollection: {
    //     trashInner1,
    //     trashInner2,
    //     trashMiddle1,
    //     trashMiddle2,
    //     trashOuter1,
    //     trashCross,
    //   },
    // });


    objectsSupportDataRef.current = supportData;
    useSolarStore.getState().setInitialized2(true);
    useSolarStore.getState().batchUpdateAdditionalProperties(supportData);
    DEV_MODE && console.log("update supportData", supportData);
  }, [isInitialized, combinedObjects, objectsDistance, orbitAngleOffset, maxDistance, minDistance, objectsRelativeScale, DEV_MODE]);

  const trashInner1 = useMemo(() => {
    console.log("trashInner1", objectsDistance);
    return generateTrash(1000, 1, 0.25 / (objectsDistance ?? 1), 1, "inner circle")
  }, [objectsDistance]);
  const trashInner2 = useMemo(() => {
    return generateTrash(1000, 1, 0.25 / (objectsDistance ?? 1), 1, "inner circle", 2)
  }, [objectsDistance]);
  const trashMiddle1 = useMemo(() => {
    return generateTrash(1000, 1 , 0.6 / (objectsDistance ?? 1), 1, "middle circle")
  }, [objectsDistance]);
  const trashMiddle2 = useMemo(() => {
    return generateTrash(1000 / 50, 1, 0.6 / (objectsDistance ?? 1), 1, "middle circle")
  }, [objectsDistance]);
  const trashOuter1 = useMemo(() => {
    return generateTrash(4000, 1, 0.05 / (objectsDistance ?? 1), 1, "outer circle")
  }, [objectsDistance]);
  const trashCross = useMemo(() => generateCrossingObjects(100, [10, 10, 3]), []);

  useEffect(() => {
    if (!isInitialized) return;

    useSolarStore.getState().batchUpdateCelestialBodies({
      trashCollection: {
        trashInner1,
        trashInner2,
        trashMiddle1,
        trashMiddle2,
        trashOuter1,
        trashCross,
      },
    });

    DEV_MODE && console.log("Trash init");
    updateSystemSettings({ trashInitialized: true });

  }, [isInitialized, trashInner1, trashInner2, trashMiddle1, trashMiddle2, trashOuter1, trashCross, updateSystemSettings, DEV_MODE]);


  // useEffect(() => {
  //   if (!isInitialized || !isInitialized2) return;

  //   console.log("init trash");



  // }, [isInitialized, isInitialized2])


  useFrame((state) => {
    if (!isInitialized || !isInitialized2) return;

    const time = state.clock.getElapsedTime();
    const updatedObjectsData: Record<string, ObjectsRealtimeDataT> = {};

    Object.keys(combinedObjects).forEach((name) => {
      // const anchorPoint = (combinedObjects[name]?.anchorXYOffset?.y ?? 0);
      // const startTimeOffset = useSolarStore.getState().additionalProperties[name]?.rotationOffset ?? 0;
      const startTimeOffset = combinedObjects[name]?.rotationOffset ?? 0;

      const supportData = objectsSupportDataRef.current[name];
      const moonsCompenstation = supportData.type === "moons" ? moonsRotationSpeed : 1;
      const t = calculateTime(
        time,
        (combinedObjects[name].siderealOrbitPeriodDays || 365) * moonsCompenstation,
        timeSpeed,
        timeOffset
      );

      const position = positionVectorsRef.current[name];
      position.set(
        Math.cos(t + startTimeOffset) * (supportData.distanceXY.x),
        0,
        Math.sin(t + startTimeOffset) * (supportData.distanceXY.y) + 0// + (combinedObjects[name].anchorXYOffset.y ??)
      );

      quaternionRef.current.setFromAxisAngle({x: 1, y: 0, z: 0}, supportData.angleRad);
      position.applyQuaternion(quaternionRef.current);

      updatedObjectsData[name] = { position };
    });

    useSolarPositionsStore.getState().batchUpdateProperties(updatedObjectsData);

  });
};
