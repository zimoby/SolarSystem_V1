import { useEffect, useRef, useState } from "react";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import * as THREE from "three";
import { Html, Line } from "@react-three/drei";

export const PlanetHUDComponent = ({ planetName, planetSize }) => {
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
        params={{ name: planetName }}
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

export const InfoAboutObject = ({ position, offset, params }) => {
  return (
    <Html position={[position[0], position[1] - offset, position[2]]} center>
      <div
        className="w-fit h-auto px-1 text-left text-xs text-red-50 bg-black/70 rounded-sm select-none cursor-pointer"
        style={{ transform: "translate(50%, 75%)" }}
        onClick={() => {
          useSystemStore.getState().setActiveObjectName(params.name);
        }}
      >
        <div className="uppercase text-base font-extrabold">{params.name}</div>
        <div className="font-mono text-3xs whitespace-nowrap">
          {position[0].toFixed(2)} {position[1].toFixed(2)} {position[2].toFixed(2)}
        </div>
      </div>
    </Html>
  );
};
