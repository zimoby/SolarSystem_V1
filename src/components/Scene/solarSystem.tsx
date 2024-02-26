import {
  useCelestialBodyUpdates,
  useInitiateSolarSystem,
} from "../../hooks/dataProcessing";
import { useSolarStore } from "../../store/systemStore";

import { SunComponent } from "../Objects/sun";
import RandomObjects from "../controls/randomObjects";
import SolarSystemPlanets from "../controls/solarSystemPlanets";
import { TrashComponent } from "../Objects/trash";

export const SolarSystem = () => {
  const isInitialized = useSolarStore((state) => state.isInitialized);
  const isInitialized2 = useSolarStore((state) => state.isInitialized2);
  const trashInitialized = useSolarStore((state) => state.trashInitialized);

  useInitiateSolarSystem();
  useCelestialBodyUpdates();

  return (
    <>
      {isInitialized && isInitialized2 && trashInitialized && (
        <group>
          <SunComponent />
          <SolarSystemPlanets />
          <RandomObjects />
          <TrashComponent />
          {/* <AsteroidsText /> */}
        </group>
      )}
    </>
  );
};

