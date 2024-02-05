import { useKeyboardControls, useTexture } from "@react-three/drei";
import { useCelestialBodyUpdates, useInitiateSolarSystem } from "../../hooks/dataProcessing";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";

import earthTexture from "../../assets/2k_earth_daymap.jpg";
import jupiterTexture from "../../assets/2k_jupiter.jpg";
import marsTexture from "../../assets/2k_mars.jpg";
import mercuryTexture from "../../assets/2k_mercury.jpg";
import neptuneTexture from "../../assets/2k_neptune.jpg";
import saturnTexture from "../../assets/2k_saturn.jpg";
import uranusTexture from "../../assets/2k_uranus.jpg";
import venusTexture from "../../assets/2k_venus_surface.jpg";
import { PlanetComponent } from "../Objects/planet";
import { SunComponent } from "../Objects/sun";
import { useEffect, useState } from "react";
// import skyStars from "../../assets/2k_stars_milky_way.jpg";

export const SolarSystem = () => {
	const isInitialized = useSystemStore((state) => state.isInitialized);
  useInitiateSolarSystem();
  useCelestialBodyUpdates();
	
  return (
    <>
      <GeneratePlanets />
      <SunComponent />
    </>
  );
};

export const GeneratePlanets = () => {
  const getPlanetsData = useSolarSystemStore((state) => state.celestialBodies.planets);

  // console.log("moonsData", moonsData, getPlanetsData);

  //   console.log("positions", useSolarSystemStore((state) => state.properties["earth"]));
  //   console.log("positions", useSolarSystemStore((state) => state.properties));

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

  const planetsComposition = Object.keys(getPlanetsData).map((planetName, index) => {
    const planetTexture = mapedTextures[planetName];
    return (
      <PlanetComponent
        key={index}
        planetName={planetName}
        params={getPlanetsData[planetName]}
        planetTexture={planetTexture}
      />
    );
  });

  return <>{planetsComposition}</>;
};
