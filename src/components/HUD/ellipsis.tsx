import { useEffect, useMemo, useRef, useState } from "react";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import {
  calculateRelativeDistance,
  calculateRelativeScale,
  degreesToRadians,
} from "../../utils/calculations";
import * as THREE from "three";
import { Circle, Line } from "@react-three/drei";


export const ObjectEllipse = ({ params, name, objSelected, color = "grey", opacity = 1, typeOfObject = ""}) => {
  const [selected, setSelected] = useState(false);

  // console.log("objSelected", color);

  useEffect(() => {
    // if (objSelected) {
      setSelected(objSelected);
    // }
  }, [objSelected]);

  // const activeObjectName = useSystemStore(state => state.activeObjectName);
  const objectsDistance = useSystemStore.getState().objectsDistance;
  // if 

  const planetDistanceX = calculateRelativeDistance(
    params.semimajorAxis10_6Km * (1 - params.orbitEccentricity),
    objectsDistance
  );
  const planetDistanceY = calculateRelativeDistance(
    params.semimajorAxis10_6Km * (1 + params.orbitEccentricity),
    objectsDistance
  );

  const planetInclination = degreesToRadians(
    params.orbitInclinationDeg + useSystemStore.getState().orbitAngleOffset
  );

  const points = useMemo(() => 
    new THREE.EllipseCurve(0, 0, planetDistanceX, planetDistanceY, 0, Math.PI * 2, false).getPoints(64 * 1),
    [planetDistanceX, planetDistanceY]
  );

  const randomPosition = useMemo(() => { return Math.random() / 10; }, []);


  const createFilledEllipse = () => {
    // Create a circle geometry with a radius of 1 as a base
    const geometry = new THREE.CircleGeometry(1, 64); // 64 segments for smoothness
    // Scale the geometry to create an ellipse, using planetDistanceX and the adjusted planetDistanceY
    geometry.scale(planetDistanceX, planetDistanceY * Math.cos(planetInclination), 1);
    
    // Create a mesh basic material with the provided color and opacity
    const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.05 });

    // Return the mesh
    return <mesh geometry={geometry} material={material} rotation={[Math.PI, 0, 0]} position={[0,0, randomPosition]} />;
  };


  const pointsDependOnInclination = useMemo(() => {
    // Adjusting the minor axis based on inclination
    const ellipseSize = planetDistanceY * Math.cos(planetInclination); // Assuming Y is the minor axis
    return new THREE.EllipseCurve(
      0,
      0,
      planetDistanceX, // Major axis remains unchanged
      ellipseSize,     // Adjusted minor axis based on inclination
      0,
      Math.PI * 2,
      false
    ).getPoints(64);
  }, [planetDistanceX, planetDistanceY, planetInclination]);

  return (
    <>
      <group onPointerOver={() => setSelected(true)} onPointerLeave={() => setSelected(objSelected || false)}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <Line
            points={pointsDependOnInclination}
            color={!selected ? color : "yellow"}
            lineWidth={1}
            transparent={true}
            opacity={opacity / 3}
          />
          {/* {typeOfObject === "planet" && createFilledEllipse()} */}
          {/* <Circle
            args={[planetDistanceX, 64]}
            rotation={[0, Math.PI, 0]}
            position={[0, 0, 0]}
            color={!selected ? color : "yellow"}
            lineWidth={1}
            transparent={true}
            opacity={opacity / 3}
          /> */}
        </mesh>
        <mesh rotation={[Math.PI / 2 + planetInclination, 0, 0]}>
          <Line points={points} color={!selected ? color : "yellow"} lineWidth={1} transparent={true} opacity={opacity} />
        </mesh>
      </group>
    </>
  );
};
