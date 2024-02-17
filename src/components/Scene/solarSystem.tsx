import {
  useCelestialBodyUpdates,
  useInitiateSolarSystem,
} from "../../hooks/dataProcessing";
import { useSystemStore } from "../../store/systemStore";

import { SunComponent } from "../Objects/sun";
import RandomObjects from "../controls/randomObjects";
import SolarSystemPlanets from "../controls/solarSystemPlanets";
import { TrashComponent } from "../Objects/trash";
import { OrbitDisk } from "../Objects/disk";
import { useEffect, useState } from "react";
// import skyStars from "../../assets/2k_stars_milky_way.jpg";

export const SolarSystem = () => {
  // const [allInitialized, setAllInitialized] = useState(false);
  const { isInitialized, isInitialized2, disableTrash, sunInitialized, planetsInitialized, randomObjectsInitialized, trashInitialized } = useSystemStore();
  // const { sunInitialized, planetsInitialized, randomObjectsInitialized, trashInitialized } = useSystemStore();

  useInitiateSolarSystem();
  useCelestialBodyUpdates();

  // useEffect(() => {
  //   // Check if all components are initialized
  //   if (sunInitialized && planetsInitialized && randomObjectsInitialized && !allInitialized) {
  //     // Introduce a delay before showing the solar system
  //     setTimeout(() => setAllInitialized(true), 1000); // Adjust the delay as needed
  //   }
  // }, [sunInitialized, planetsInitialized, randomObjectsInitialized, allInitialized]);


  // console.log("isInitialized", isInitialized, isInitialized2);

  return (
    <>
      {isInitialized && isInitialized2 && (
        <group>
          <SunComponent />
          <SolarSystemPlanets />
          <RandomObjects />
          {!disableTrash && <TrashComponent />}
        </group>
      )}
    </>
  );
};

