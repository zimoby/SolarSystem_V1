import React from "react";
import ObjectsComponent from "../objects/objects";

const RandomObjects = ({ objectsData }) => {
  return (
    <>
      {Object.keys(objectsData).map((objectName, index) => {
        return (
          <ObjectsComponent
            key={index + "_objects"}
            planetName={objectName}
            params={objectsData[objectName]}
          />
        );
      })}
    </>
  );
};

export default RandomObjects;
