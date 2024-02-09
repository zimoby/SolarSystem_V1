import PlanetComponent from "../objects/planet";

const SolarSystemPlanets = ({ planetsData, planetsTexture }) => {
  return (
    <>
      {Object.keys(planetsData).map((planetName, index) => {
        return (
          <PlanetComponent
            key={planetName + index}
            planetName={planetName}
            params={planetsData[planetName]}
            planetTexture={planetsTexture[planetName]}
          />
        );
      })}
    </>
  );
};

export default SolarSystemPlanets;
