import React from "react";
import ObjectsComponent from "../objects/objects";
import { useSolarSystemStore } from "../../store/systemStore";

const RandomObjects = () => {

  const getObjectsData = useSolarSystemStore(
    (state) => state.celestialBodies.objects
  );

  return (
    <>
      {Object.keys(getObjectsData).map((objectName, index) => {
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
