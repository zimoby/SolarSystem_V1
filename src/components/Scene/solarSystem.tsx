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
  const disableTrash = useSolarStore((state) => state.disableTrash);

  useInitiateSolarSystem();
  useCelestialBodyUpdates();

  return (
    <>
      {isInitialized && isInitialized2 && (
        <group>
          <SunComponent />
          <SolarSystemPlanets />
          <RandomObjects />
          {!disableTrash && <TrashComponent />}
          {/* <AsteroidsText /> */}
        </group>
      )}
    </>
  );
};

