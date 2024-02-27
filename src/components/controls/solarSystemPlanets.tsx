import { useTexture } from "@react-three/drei";
import PlanetComponent from "../Objects/planet";

import earthTexture from "../../assets/2k_earth_daymap.jpg";

import jupiterTexture from "../../assets/2k_jupiter.jpg";
import marsTexture from "../../assets/2k_mars.jpg";
import mercuryTexture from "../../assets/2k_mercury.jpg";
import neptuneTexture from "../../assets/2k_neptune.jpg";
import saturnTexture from "../../assets/2k_saturn.jpg";
import uranusTexture from "../../assets/2k_uranus.jpg";
import venusTexture from "../../assets/2k_venus_surface.jpg";
import { useSolarStore } from "../../store/systemStore";
import { useEffect } from "react";
import { OrbitDisk } from "../Objects/disk";

const SolarSystemPlanets = () => {
  const getPlanetsData = useSolarStore((state) => state.celestialBodies.planets);
  const planetsInitialized = useSolarStore((state) => state.planetsInitialized);
  const disableOrbits = useSolarStore((state) => state.disableOrbits);
  const updatePlanetsInitialized = useSolarStore((state) => state.updateSystemSettings);

  const DEV_MODE = useSolarStore((state) => state.DEV_MODE);

  const [
    createEarthTexture,
    createJupiterTexture,
    createMarsTexture,
    createMercuryTexture,
    createNeptuneTexture,
    createSaturnTexture,
    createUranusTexture,
    createVenusTexture,
  ] = useTexture([
    earthTexture,
    jupiterTexture,
    marsTexture,
    mercuryTexture,
    neptuneTexture,
    saturnTexture,
    uranusTexture,
    venusTexture,
  ]);

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

  useEffect(() => {
    if (!planetsInitialized) {
      DEV_MODE && console.log("SolarSystemPlanets init");
      updatePlanetsInitialized({ planetsInitialized: true });
    }
  }, [DEV_MODE, planetsInitialized, updatePlanetsInitialized]);

  return (
    <>
      {Object.keys(getPlanetsData).map((planetName, index) => {
        return (
          <PlanetComponent
            key={planetName + index}
            planetName={planetName}
            params={getPlanetsData[planetName]}
            planetTexture={mapedTextures[planetName as keyof typeof mapedTextures]}
            type="planets"
          />
        );
      })}
      {!disableOrbits && <OrbitDisk size={40} positionYoffset={-2} opacity={0.1} />}
    </>
  );
};

export default SolarSystemPlanets;
