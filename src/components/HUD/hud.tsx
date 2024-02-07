import { useEffect, useRef, useState } from "react";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import * as THREE from "three";
import { Html, Line } from "@react-three/drei";

export const PlanetHUDComponent = ({ planetName, planetSize, extendData = true, typeOfObject = "" }) => {
  const planetPositionRef = useRef(new THREE.Vector3(0, 0, 0)); // Assuming initial position
  const [updateTrigger, setUpdateTrigger] = useState(0); // Trigger state for re-rendering

  useEffect(() => {
    const unsubscribe = useSolarSystemStore.subscribe(
      (state) => {
        const newPosition = state.properties[planetName]?.position;
        if (newPosition) {
          planetPositionRef.current = newPosition; // Update position reference
          setUpdateTrigger((prev) => (prev + 1) % 100); // Trigger re-render
        }
      },
      (state) => state.properties[planetName]
    );
    return unsubscribe;
  }, [planetName]);

  const lineFromZeroOrbitToPlanet = [new THREE.Vector3(0, 0, 0), planetPositionRef.current];
  const lineFromZeroOrbitToPlanet2 = [
    new THREE.Vector3(planetPositionRef.current.x, 0, planetPositionRef.current.z),
    planetPositionRef.current,
  ];

  return (
    <>
      <InfoAboutObject
        position={[
          planetPositionRef.current.x,
          planetPositionRef.current.y,
          planetPositionRef.current.z,
        ]}
        offset={planetSize}
        params={{ name: planetName, extendData}}
        typeOfObject={typeOfObject}
      />
      <Line
        points={lineFromZeroOrbitToPlanet}
        color="white"
        lineWidth={1}
        transparent={true}
        opacity={0.3}
      />
      <Line
        points={lineFromZeroOrbitToPlanet2}
        color="white"
        lineWidth={1}
        transparent={true}
        opacity={0.3}
      />
    </>
  );
};

export const InfoAboutObject = ({ position, offset, params, typeOfObject = "" }) => {

  let textStyle;
  let bgStyle;
  switch (typeOfObject) {
    case "object":
      // bgStyle = "bg-red-600/70";
      bgStyle = "bg-black/70";
      textStyle = " text-xs";
      break;
    case "star":
      bgStyle = "bg-yellow-600/70";
      textStyle = " text-xs";
      break;
    case "moon":
      bgStyle = "bg-gray-600/70";
      textStyle = " text-xs";
      break;
    default:
      bgStyle = "bg-black/70 ";
      textStyle = "uppercase font-extrabold text-xs";
      break;
  }

  
  return (
    <Html position={[position[0], position[1] - offset, position[2]]} center>
      <div
        className={`w-fit h-auto px-1 text-left ${bgStyle} text-red-50 rounded-sm select-none cursor-pointer`}
        style={{ transform: "translate(50%, 75%)" }}
        onClick={() => {
          useSystemStore.getState().updateSystemSettings({ activeObjectName: params.name });
        }}
      >
        <div className={`${textStyle} text-base`}>{params.name}</div>
        {params.extendData && (
          <div className="font-mono text-3xs whitespace-nowrap">
            {position[0].toFixed(2)} {position[1].toFixed(2)} {position[2].toFixed(2)}
          </div>
        )}
      </div>
    </Html>
  );
};
