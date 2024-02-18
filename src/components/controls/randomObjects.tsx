import ObjectsComponent from "../Objects/objects";
import { useSolarStore } from "../../store/systemStore";
import { useEffect } from "react";

const RandomObjects = () => {
  const getObjectsData = useSolarStore((state) => state.celestialBodies.objects);
  const randomObjectsInitialized = useSolarStore((state) => state.randomObjectsInitialized);
  const disableRandomObjects = useSolarStore((state) => state.disableRandomObjects);
  const updateSystemSettings = useSolarStore((state) => state.updateSystemSettings);

  useEffect(() => {
    if (!randomObjectsInitialized) {
      console.log("RandomObjects init");
      updateSystemSettings({ randomObjectsInitialized: true });
    }
  }, [randomObjectsInitialized, updateSystemSettings]);

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
