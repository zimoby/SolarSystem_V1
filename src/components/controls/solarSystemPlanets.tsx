import { Bounds, useBounds } from "@react-three/drei";
import PlanetComponent from "../Objects/planet";


// function SelectToZoom({ children }) {
//   const api = useBounds()
//   return (
//     <group onClick={(e) => (e.stopPropagation(), e.delta <= 2 && api.refresh(e.object).fit())} onPointerMissed={(e) => e.button === 0 && api.refresh().fit()}>
//       {children}
//     </group>
//   )
// }



const SolarSystemPlanets = ({ planetsData, planetsTexture }) => {
  return (
    <>
      {Object.keys(planetsData).map((planetName, index) => {
        return (
          // <Bounds fit clip observe margin={1.2}>
          //   <SelectToZoom>
              <PlanetComponent
                key={planetName + index}
                planetName={planetName}
                params={planetsData[planetName]}
                planetTexture={planetsTexture[planetName]}
              />
            // </SelectToZoom>
          // </Bounds>
        );
      })}
    </>
  );
};

export default SolarSystemPlanets;


