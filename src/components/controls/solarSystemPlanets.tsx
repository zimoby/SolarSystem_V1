import { Bounds, useBounds, useTexture } from "@react-three/drei";
import PlanetComponent from "../Objects/planet";

import earthTexture from "../../assets/2k_earth_daymap.jpg";
import jupiterTexture from "../../assets/2k_jupiter.jpg";
import marsTexture from "../../assets/2k_mars.jpg";
import mercuryTexture from "../../assets/2k_mercury.jpg";
import neptuneTexture from "../../assets/2k_neptune.jpg";
import saturnTexture from "../../assets/2k_saturn.jpg";
import uranusTexture from "../../assets/2k_uranus.jpg";
import venusTexture from "../../assets/2k_venus_surface.jpg";
import { useSolarSystemStore } from "../../store/systemStore";

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
      {Object.keys(getPlanetsData).map((planetName, index) => {
        return (
          // <Bounds fit clip observe margin={1.2}>
          //   <SelectToZoom>
          <PlanetComponent
            key={planetName + index}
            planetName={planetName}
            params={getPlanetsData[planetName]}
            planetTexture={mapedTextures[planetName]}
          />
          // </SelectToZoom>
          // </Bounds>
        );
      })}
    </>
  );
};

export default SolarSystemPlanets;
