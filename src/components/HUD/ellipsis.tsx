import { useEffect, useMemo, useRef, useState } from "react";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import {
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

  color = "white"

  useEffect(() => {
      setSelected(objSelected);
  }, [objSelected]);

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
    return new THREE.EllipseCurve(
      0,
      0,
      distanceXY.x * solarScale,
      distanceXY.y * Math.cos(planetInclination) * solarScale,    
      0,
      Math.PI * 2,
      false
    ).getPoints(64);
  }, [distanceXY.x, distanceXY.y, planetInclination, solarScale]);

  const randomZposition = useMemo(() => {
    const decr = 4;
    return ((Math.random()) / decr - 0.08);
  }, []);

  useCursor(selected);

  return (
    <group>
      <mesh position={[0, randomZposition - 0.5, 0]} rotation-x={Math.PI / 2} scale={solarScale}>
        <Circle args={[distanceXY.x, 64]}>
          <meshBasicMaterial side={THREE.DoubleSide} transparent={true} opacity={0.1} depthWrite={false}>
            <GradientTexture
              stops={[0, 0.5, 1]}
              colors={['yellow', 'purple', 'blue']}
              size={1024}
              width={1024}
              type={GradientType.Radial}
              innerCircleRadius={0}
              outerCircleRadius={'auto'}
            />
          </meshBasicMaterial>
        </Circle>
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
