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
// import skyStars from "../../assets/2k_stars_milky_way.jpg";

export const SolarSystem = () => {
  const { isInitialized, isInitialized2, disableTrash } = useSystemStore((state) => state);

  useInitiateSolarSystem();
  useCelestialBodyUpdates();

  return (
    <>
      {isInitialized && isInitialized2 && (
        <>
          <SunComponent />
          <SolarSystemPlanets />
          <RandomObjects />
          {!disableTrash && <TrashComponent />}
          <OrbitDisk size={40} positionYoffset={-2} opacity={0.1} />
        </>
      )}
    </>
  );
};

