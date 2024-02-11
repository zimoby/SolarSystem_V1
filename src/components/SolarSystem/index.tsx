import { Circle, GradientTexture, GradientType, Instance, Instances, Plane, Point, PointMaterial, Points, Stars, useKeyboardControls, useTexture } from "@react-three/drei";
import {
  useCelestialBodyUpdates,
  useInitiateSolarSystem,
} from "../../hooks/dataProcessing";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import earthTexture from "../../assets/2k_earth_daymap.jpg";
import jupiterTexture from "../../assets/2k_jupiter.jpg";
import marsTexture from "../../assets/2k_mars.jpg";
import mercuryTexture from "../../assets/2k_mercury.jpg";
import neptuneTexture from "../../assets/2k_neptune.jpg";
import saturnTexture from "../../assets/2k_saturn.jpg";
import uranusTexture from "../../assets/2k_uranus.jpg";
import venusTexture from "../../assets/2k_venus_surface.jpg";
import { SunComponent } from "../objects/sun";
import { useEffect, useMemo, useRef, useState } from "react";
import RandomObjects from "../controls/randomObjects";
import SolarSystemPlanets from "../controls/solarSystemPlanets";
import { DoubleSide, Euler, MathUtils } from "three";
import { useFrame } from "@react-three/fiber";
import { generateTrash } from "../../utils/generators";
import { TrashComponent } from "../Objects/trash";
// import skyStars from "../../assets/2k_stars_milky_way.jpg";

export const SolarSystem = () => {
  const { isInitialized, disableTrash } = useSystemStore((state) => state);
  useInitiateSolarSystem();
  useCelestialBodyUpdates();
  const getObjectsData = useSolarSystemStore(
    (state) => state.celestialBodies.objects
  );
  const getPlanetsData = useSolarSystemStore(
    (state) => state.celestialBodies.planets
  );

  const createEarthTexture = useTexture(earthTexture);
  const createJupiterTexture = useTexture(jupiterTexture);
  const createMarsTexture = useTexture(marsTexture);
  const createMercuryTexture = useTexture(mercuryTexture);
  const createNeptuneTexture = useTexture(neptuneTexture);
  const createSaturnTexture = useTexture(saturnTexture);
  const createUranusTexture = useTexture(uranusTexture);
  const createVenusTexture = useTexture(venusTexture);

  const mapedTextures = {
    earth: createEarthTexture,
    jupiter: createJupiterTexture,
    mars: createMarsTexture,
    mercury: createMercuryTexture,
    neptune: createNeptuneTexture,
    saturn: createSaturnTexture,
    uranus: createUranusTexture,
    venus: createVenusTexture,
  };

  return (
    <>
      {!disableTrash && <TrashComponent />}
      <SolarSystemPlanets planetsData={getPlanetsData} planetsTexture={mapedTextures} />
      <RandomObjects objectsData={getObjectsData} />
      <SunComponent />

      {/* <Circle args={[10, 64]} position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0] }>
        <meshBasicMaterial side={DoubleSide} transparent={true} opacity={0.3}>
          <GradientTexture
            stops={[0, 0.3, 1]} // As many stops as you want
            colors={['yellow', 'purple', 'black']} // Colors need to match the number of stops
            size={1024} // Size (height) is optional, default = 1024
            width={1024} // Width of the canvas producing the texture, default = 16
            type={GradientType.Radial} // The type of the gradient, default = GradientType.Linear
            innerCircleRadius={0} // Optional, the radius of the inner circle of the gradient, default = 0
            outerCircleRadius={'auto'} // Optional, the radius of the outer circle of the gradient, default = auto
          />
        </meshBasicMaterial>
      </Circle> */}
          

    </>
  );
};

