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
  rotationY?: number;
  rotationOffset?: number;
  name?: string;
  type?: string | null;
  type2?: string;
  planetName?: string;
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
    directLineObject: { color: string; opacity: number };
    directLine: { color: string; opacity: number };
  };
  objectDefaultColors: { [key: string]: string };
  atmosphereDefaultColors: { [key: string]: string };
  updateColors: (updates: Partial<SystemColorsStateT>) => void;
}

interface CollectedSolarObjectInfo {
  [key: string]: SolarObjectParamsBasicWithMoonsT;
}

export interface SystemStoreStateT {
  DEV_MODE: boolean;
  
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
  disableOrbits: boolean;

  activeObjectName: string;
  activeObjectNameInfo: string;
  activeObjectInfo: CollectedSolarObjectInfo;

  timeSpeed: number;
  timeOffset: number;
  objectsDistance: number;
  objectsRelativeScale: number;
  orbitAngleOffset: number;
  maxDistance: number;
  minDistance: number;

  orbitPathDetalization: number;

  updateSystemSettings: (updates: Partial<SystemStoreStateT>) => void;
  setInitialized: (isInitialized: boolean) => void;
  setInitialized2: (isInitialized2: boolean) => void;
}

export interface ObjectsRealtimeDataT {
  position: Vector3;
  rotation?: Euler;
}

export type ObjectsAdditionalDataT = SolarObjectParamsBasicT & {
  type?: string | null;
  type2?: string;
  color?: Color | string | undefined;
  moonsAmount?: number;
  // rotationY?: number;
  // rotationOffset?: number;
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
      // trashInner1: TrashParamsT[];
      // trashInner2: TrashParamsT[];
      // trashMiddle1: TrashParamsT[];
      // trashMiddle2: TrashParamsT[];
      // trashOuter1: TrashParamsT[];
      // trashCross: CrossingTrashParamsT[];
    };
  };
  batchUpdateCelestialBodies: (updates: Partial<SolarSystemStoreStateT["celestialBodies"]>) => void;
  additionalProperties: ObjectsSupportDataT;
  batchUpdateAdditionalProperties: (
    updates: Partial<SolarSystemStoreStateT["additionalProperties"]>
  ) => void;
}

export interface SolarSystemStoreRealtimeStateT {
  properties: { [key: string]: ObjectsRealtimeDataT };
  batchUpdateProperties: (updates: Partial<SolarSystemStoreRealtimeStateT["properties"]>) => void;
}

export interface SupportDataT {
  distanceXY: {
    x: number;
    y: number;
  };
  angleRad: number;
  // rotationY: number;
  // rotationOffset: number;
  type?: string;
  scale: number;
}

export interface ObjectsSupportDataT {
  [key: string]: SupportDataT;
}

export interface PositionVectorsT {
  [key: string]: THREE.Vector3;
}

export type ObjectEllipseProps = {
  params: ObjectsAdditionalDataT;
  name: string;
  color?: THREE.Color | string;
  opacity?: number;
  type?: string;
  extraRotation?: number;
};

export type PlanetComponentProps = {
  planetName: string;
  params: SolarObjectParamsBasicWithMoonsT;
  planetTexture?: THREE.Texture | null;
  type: string;
  rotationCorrection?: number;
};
