import { useEffect, useMemo, useRef, useState } from "react";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import {
  calculateRelativeDistanceXY,
  degreesToRadians,
} from "../../utils/calculations";
import * as THREE from "three";
import { Circle, CycleRaycast, GradientTexture, GradientType, Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export const ObjectEllipse = ({ params, name, objSelected, color = "grey", opacity = 1, typeOfObject = ""}) => {
  const [selected, setSelected] = useState(false);
  // const addCalcs = useSolarSystemStore.getState().additionalProperties[name];
  const { solarScale } = useSystemStore.getState();

  const dashOffsetRef = useRef(0);

  // console.log("additionalCalculationsStore", addCalcs);

  color = "white"

  useEffect(() => {
      setSelected(objSelected);
  }, [objSelected]);

  const {
    x: planetDistanceX,
    y: planetDistanceY
  } = calculateRelativeDistanceXY(
    params.semimajorAxis10_6Km,
    params.orbitEccentricity,
    useSystemStore.getState().objectsDistance);

  const planetInclination = degreesToRadians(
    params.orbitInclinationDeg + useSystemStore.getState().orbitAngleOffset
  );

  // useFrame((state) => {
    // const time = state.clock.getElapsedTime() * Math.PI * 2;
    // dashOffsetRef.current.dashOffset = (time/10) % 1000;
    // dashOffsetRef.current.geometry.attributes.position.needsUpdate = true;
    // dashOffsetRef.current.needsUpdate = true;
  // }); 

  // console.log("dashOffsetRef", dashOffsetRef);


  const points = useMemo(() => 
    new THREE.EllipseCurve(0, 0, planetDistanceX * solarScale, planetDistanceY * solarScale, 0, Math.PI * 2, false).getPoints(64 * 1),
    [planetDistanceX, planetDistanceY, solarScale]
  );

  
  const pointsDependOnInclination = useMemo(() => {
    // Adjusting the minor axis based on inclination
    return new THREE.EllipseCurve(
      0,
      0,
      planetDistanceX * solarScale, // Major axis remains unchanged
      planetDistanceY * Math.cos(planetInclination) * solarScale,     // Adjusted minor axis based on inclination
      0,
      Math.PI * 2,
      false
    ).getPoints(64);
  }, [planetDistanceX, planetDistanceY, planetInclination, solarScale]);

  // const lineMaterial = useMemo(() => {
  //   return new THREE.LineDashedMaterial({ color: color });
  // }, [color, opacity]);

  const randomZposition = useMemo(() => {
    const decr = 4;
    return ((Math.random()) / decr - 0.08);
  }, []);

  return (
    <>
      <group onPointerOver={() => setSelected(true)} onPointerLeave={() => setSelected(objSelected || false)}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
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
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <Circle args={[planetDistanceX, 64]} position={[0, 0, randomZposition]} rotation={[0, 0, 0] }>
            <meshBasicMaterial side={THREE.DoubleSide} transparent={true} opacity={0.1}>
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

        {/* (params.anchorXYOffset?.x ?? 0), (params.anchorXYOffset?.y ?? 0) */}

        {/* <mesh rotation={[Math.PI / 2 , 0, 0]}> */}
        <mesh rotation={[Math.PI / 2 + planetInclination, 0, 0]}>
          <Line
            position={[0, 0, 0]} // (params.anchorXYOffset?.y ?? 0)
            points={points}
            color={!selected ? color : "yellow"}
            lineWidth={1}
            transparent={true}
            opacity={opacity}
          />
        </mesh>
      </group>
    </>
  );
};
