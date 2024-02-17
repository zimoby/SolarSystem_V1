import ObjectsComponent from "../Objects/objects";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import { useEffect } from "react";

const RandomObjects = () => {
  const getObjectsData = useSolarSystemStore((state) => state.celestialBodies.objects);
  const { randomObjectsInitialized, disableRandomObjects } = useSystemStore((state) => state)

  useEffect(() => {
    if (!randomObjectsInitialized) {
      console.log("RandomObjects init");
      useSystemStore.getState().updateSystemSettings({ randomObjectsInitialized: true });
    }
  
  }, [randomObjectsInitialized]);


  return (
    <>
      {!disableRandomObjects && Object.keys(getObjectsData).map((objectName, index) => {
        return (
          <ObjectsComponent
            key={index + "_objects"}
            planetName={objectName}
            params={getObjectsData[objectName]}
          />
        );
      })}
    </>
  );
};

export default RandomObjects;
