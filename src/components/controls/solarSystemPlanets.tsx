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
import { useSolarSystemStore, useSolarStore } from "../../store/systemStore";
import { useEffect } from "react";
import { OrbitDisk } from "../Objects/disk";

// function SelectToZoom({ children }) {
//   const api = useBounds()
//   return (
//     <group onClick={(e) => (e.stopPropagation(), e.delta <= 2 && api.refresh(e.object).fit())} onPointerMissed={(e) => e.button === 0 && api.refresh().fit()}>
//       {children}
//     </group>
//   )
// }

const SolarSystemPlanets = () => {
  const getPlanetsData = useSolarSystemStore((state) => state.celestialBodies.planets);
  const { planetsInitialized } = useSolarStore((state) => state)

  const [
    createEarthTexture,
    createJupiterTexture,
    createMarsTexture,
    createMercuryTexture,
    createNeptuneTexture,
    createSaturnTexture,
    createUranusTexture,
    createVenusTexture
  ] = useTexture([
    earthTexture,
    jupiterTexture,
    marsTexture,
    mercuryTexture,
    neptuneTexture,
    saturnTexture,
    uranusTexture,
    venusTexture
  ]);


  // console.log("SolarSystemPlanets");

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
      console.log("SolarSystemPlanets init");
      useSolarStore.getState().updateSystemSettings({ planetsInitialized: true });
    }
  }, [planetsInitialized]);

  return (
    <>
      {Object.keys(getPlanetsData).map((planetName, index) => {
        return (
          // <Bounds fit clip observe margin={1.2}>
          //   <SelectToZoom>
          <PlanetComponent
            key={planetName + index}
            planetName={planetName}
            params={getPlanetsData[planetName]}
            planetTexture={mapedTextures[planetName as keyof typeof mapedTextures]}
            type="planets"
          />
          // </SelectToZoom>
          // </Bounds>
        );
      })}
      <OrbitDisk size={40} positionYoffset={-2} opacity={0.1} />
    </>
  );
};

export default SolarSystemPlanets;
