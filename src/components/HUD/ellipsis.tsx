import { useEffect, useMemo, useRef, useState } from "react";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import {
  calculateRelativeDistanceXY,
  degreesToRadians,
} from "../../utils/calculations";
import * as THREE from "three";
import { Circle, CycleRaycast, GradientTexture, GradientType, Line, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export const ObjectEllipse = ({ params, name, objSelected, color = "grey", opacity = 1, typeOfObject = ""}) => {
  const [selected, setSelected] = useState(false);
  const {distanceXY} = useSolarSystemStore.getState().additionalProperties[name] || { distanceXY: { x: 0, y: 0 } };
  const { solarScale } = useSystemStore.getState();

  const dashOffsetRef = useRef();

  // const pointsRef = useRef(new THREE.EllipseCurve(0, 0, distanceXY.x * solarScale, distanceXY.y * solarScale, 0, Math.PI * 2, false).getPoints(64 * 1));

  // useEffect(() => {
  //   console.log("ObjectEllipse init", distanceXY);
  // }, [distanceXY]);

  color = "white"

  useEffect(() => {
      setSelected(objSelected);
  }, [objSelected]);

  // const {
  //   x: planetDistanceX,
  //   y: planetDistanceY
  // } = calculateRelativeDistanceXY(
  //   params.semimajorAxis10_6Km,
  //   params.orbitEccentricity,
  //   useSystemStore.getState().objectsDistance);

  const planetInclination = degreesToRadians(
    params.orbitInclinationDeg + useSystemStore.getState().orbitAngleOffset
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime() * Math.PI * 2;
    dashOffsetRef.current.material.dashOffset = -(time) % Math.PI * 2;
  }); 

  const points = useMemo(() => 
    new THREE.EllipseCurve(0, 0, distanceXY.x * solarScale, distanceXY.y * solarScale, 0, Math.PI * 2, false).getPoints(64 * 1),
    [distanceXY.x, distanceXY.y, solarScale]
  );

  
  const pointsDependOnInclination = useMemo(() => {
    // Adjusting the minor axis based on inclination
    return new THREE.EllipseCurve(
      0,
      0,
      distanceXY.x * solarScale, // Major axis remains unchanged
      distanceXY.y * Math.cos(planetInclination) * solarScale,     // Adjusted minor axis based on inclination
      0,
      Math.PI * 2,
      false
    ).getPoints(64);
  }, [distanceXY.x, distanceXY.y, planetInclination, solarScale]);

  const randomZposition = useMemo(() => {
    const decr = 4;
    // console.log("randomZposition", Math.random() / decr - 0.08);
    return ((Math.random()) / decr - 0.08);
  }, []);

  useCursor(selected);

  return (
    <group>
      <mesh position={[0, randomZposition - 0.5, 0]} rotation-x={Math.PI / 2} scale={solarScale}>
        <Circle args={[distanceXY.x, 64]}>
          <meshBasicMaterial side={THREE.DoubleSide} transparent={true} opacity={0.1} depthWrite={false}>
            <GradientTexture
              stops={[0, 0.5, 1]} // As many stops as you want
              colors={['yellow', 'purple', 'blue']} // Colors need to match the number of stops
              size={1024} // Size (height) is optional, default = 1024
              width={1024} // Width of the canvas producing the texture, default = 16
              type={GradientType.Radial} // The type of the gradient, default = GradientType.Linear
              innerCircleRadius={0} // Optional, the radius of the inner circle of the gradient, default = 0
              outerCircleRadius={'auto'} // Optional, the radius of the outer circle of the gradient, default = auto
            />
          </meshBasicMaterial>
        </Circle>
        {/* <CycleRaycast preventDefault={true} /> */}
      </mesh>
      <group onPointerOver={() => setSelected(true)} onPointerLeave={() => setSelected(objSelected || false)}>
        
        <mesh rotation-x={Math.PI / 2}>
          <Line
            ref={dashOffsetRef}
            position={[0, 0, 0]}
            points={pointsDependOnInclination}
            color={!selected ? color : "yellow"}
            lineWidth={1}
            transparent={true}
            opacity={opacity / 2}
            dashed={true}
            dashSize={5}
            // dashOffset={dashOffsetRef.current}
            dashScale={30}
          >
            {/* {lineMaterial} */}
          </Line>
        </mesh>
        {/* (params.anchorXYOffset?.x ?? 0), (params.anchorXYOffset?.y ?? 0) */}

        {/* <mesh rotation={[Math.PI / 2 , 0, 0]}> */}
        <mesh rotation-x={Math.PI / 2 + planetInclination}>
          <Line
            position={[0, 0, 0]} // (params.anchorXYOffset?.y ?? 0)
            points={points}
            color={!selected ? color : "yellow"}
            lineWidth={1}
            transparent={true}
            opacity={opacity}
          />
          {/* <Line
            position={[0, 0, 0]} // (params.anchorXYOffset?.y ?? 0)
            points={points}
            color={!selected ? color : "yellow"}
            lineWidth={5}
            transparent={true}
            dashed
            // dashSize={0.2}
            dashScale={3}
            dashSize={0.2}
            opacity={opacity}
          /> */}
        </mesh>
      </group>
    </group>
  );
};
