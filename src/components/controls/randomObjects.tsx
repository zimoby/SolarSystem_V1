import ObjectsComponent from "../Objects/objects";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";

const RandomObjects = () => {
  const getObjectsData = useSolarSystemStore((state) => state.celestialBodies.objects);
  // const { isInitialized, isInitialized2 } = useSystemStore.getState();
  const { disableRandomObjects } = useSystemStore((state) => state)

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
