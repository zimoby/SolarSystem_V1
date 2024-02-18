import { Euler, Vector3 } from "@react-three/fiber";
import { Color } from "three";

export enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
  jump = "jump",
}

export type CelestialBodyType = "planets" | "moons" | "objects" | "trash" | "stars";


export interface OnlyNumbericSolarObjectParamsBasicT {
  mass10_24Kg?: number;
  volume10_10Km3?: number;
  equatorialRadius1BarLevelKm?: number;
  polarRadiusKm?: number;
  volumetricMeanRadiusKm?: number;
  ellipticity?: number;
  meanDensityKgM3?: number;
  gravityEq1BarMS2?: number;
  accelerationEq1BarMS2?: number;
  escapeVelocityKmS?: number;
  gMX10_6Km3S2?: number;
  bondAlbedo?: number;
  geometricAlbedo?: number;
  vBandMagnitudeV10?: number;
  solarIrradianceWM2?: number;
  blackBodyTemperatureK?: number;
  momentOfInertiaIMR2?: number;
  j2X106?: number;
  numberOfNaturalSatellites?: number;
  semimajorAxis10_6Km?: number;
  siderealOrbitPeriodDays?: number;
  tropicalOrbitPeriodDays?: number | null;
  perihelion10_6Km?: number;
  aphelion10_6Km?: number;
  synodicPeriodDays?: number | null;
  meanOrbitalVelocityKmS?: number;
  maxOrbitalVelocityKmS?: number;
  minOrbitalVelocityKmS?: number;
  orbitInclinationDeg?: number;
  orbitEccentricity?: number;
  siderealRotationPeriodHrs?: number;
  lengthOfDayHrs?: number;
  obliquityToOrbitDeg?: number;
  inclinationOfEquatorDeg?: number;
}

export type SolarObjectParamsBasicT = OnlyNumbericSolarObjectParamsBasicT & {
  planetaryRingSystem?: boolean;
  anchorXYOffset?: { x: number; y: number };
  name?: string;
  type?: string | null;
  type2?: string;
}

export type SolarObjectParamsBasicWithMoonsT = SolarObjectParamsBasicT & {
  moons?: SolarObjectParamsBasicT[];
};

export interface TrashParamsT {
  position: [number, number, number];
  scale: number;
  rotation: [number, number, number];
  distance: number;
  angle: number;
  color: string;
  name: string;
}

export interface CrossingTrashParamsT {
  position: {
    x: number;
    y: number;
    z: number;
  };
  velocity: {
    x: number;
    y: number;
    z: number;
  };
  scale: number;
  name: string;
}

export interface SystemColorsStateT {
  uiRandomColors: string[];
  hudColors: {
    lineUnderOrbit: { color: string; opacity: number };
    lineBelowOrbit: { color: string; opacity: number };
    directLine: { color: string; opacity: number };
  };
  objectDefaultColors: { [key: string]: string };
  updateColors: (updates: Partial<SystemColorsStateT>) => void;
}

export interface SystemStoreStateT {
  isInitialized: boolean;
  isInitialized2: boolean;
  dataInitialized: boolean;

  sunInitialized: boolean;
  planetsInitialized: boolean;
  randomObjectsInitialized: boolean;
  trashInitialized: boolean;

  disablePlanets: boolean;
  disableMoons: boolean;
  disableRandomObjects: boolean;
  disableTrash: boolean;

  activeObjectName: string;
  timeSpeed: number;
  timeOffset: number;
  objectsDistance: number;
  objectsRelativeScale: number;
  orbitAngleOffset: number;
  maxDistance: number;
  minDistance: number;
  updateSystemSettings: (updates: Partial<SystemStoreStateT>) => void;
  setInitialized: (isInitialized: boolean) => void;
  setInitialized2: (isInitialized2: boolean) => void;
}

export interface ObjectsRealtimeDataT {
  position: Vector3;
  rotation?: Euler;
}

export interface CalculatedObjectDataT {
  distanceXY: {
    x: number;
    y: number;
  };
  angleRad: number;
  scale: number;
}

export type ObjectsAdditionalDataT = SolarObjectParamsBasicT & {
  type?: string | null;
  type2?: string;
  color?: Color | string | undefined;
  moonsAmount?: number;
}

export interface SolarSystemStoreStateT {
  celestialBodies: {
    stars: Record<string, SolarObjectParamsBasicWithMoonsT>;
    planets: Record<string, SolarObjectParamsBasicWithMoonsT>;
    moons: Record<string, SolarObjectParamsBasicWithMoonsT>;
    asteroids: Record<string, SolarObjectParamsBasicWithMoonsT>;
    objects: Record<string, SolarObjectParamsBasicWithMoonsT>;
    trash: {
      trashInner1: { semimajorAxis10_6Km: number };
      trashInner2: { semimajorAxis10_6Km: number };
      trashMiddle1: { semimajorAxis10_6Km: number };
      trashMiddle2: { semimajorAxis10_6Km: number };
      trashOuter1: { semimajorAxis10_6Km: number };
    };
    trashCollection: {
      trashInner1: TrashParamsT[];
      trashInner2: TrashParamsT[];
      trashMiddle1: TrashParamsT[];
      trashMiddle2: TrashParamsT[];
      trashOuter1: TrashParamsT[];
      trashCross: CrossingTrashParamsT[];
    };
  };
  batchUpdateCelestialBodies: (updates: Partial<SolarSystemStoreStateT["celestialBodies"]>) => void;
  // properties: Record<string, ObjectsRealtimeDataT>;
  // properties: { [key: string]: ObjectsRealtimeDataT };
  // batchUpdateProperties: (updates: Partial<SolarSystemStoreStateT["properties"]>) => void;
  additionalProperties: { [key: string]: CalculatedObjectDataT };
  batchUpdateAdditionalProperties: (
    updates: Partial<SolarSystemStoreStateT["additionalProperties"]>
  ) => void;
}
