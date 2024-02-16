import { useEffect, useMemo, useRef, useState } from "react";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import {
  degreesToRadians,
} from "../../utils/calculations";
import * as THREE from "three";
import { Circle, CycleRaycast, GradientTexture, GradientType, Line, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { OrbitDisk } from "../Objects/disk";

export const ObjectEllipse = ({ params, name, objSelected, color = "grey", opacity = 1, typeOfObject = ""}) => {
  const [selected, setSelected] = useState(false);
  const {distanceXY} = useSolarSystemStore.getState().additionalProperties[name] || { distanceXY: { x: 0, y: 0 } };
  // const { solarScale } = useSystemStore.getState();

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
    new THREE.EllipseCurve(0, 0, distanceXY.x, distanceXY.y, 0, Math.PI * 2, false).getPoints(64 * 1),
    [distanceXY.x, distanceXY.y]
  );
  
  const pointsDependOnInclination = useMemo(() => {
    return new THREE.EllipseCurve(
      0,
      0,
      distanceXY.x,
      distanceXY.y * Math.cos(planetInclination),    
      0,
      Math.PI * 2,
      false
    ).getPoints(64);
  }, [distanceXY.x, distanceXY.y, planetInclination]);

  const randomZposition = useMemo(() => {
    const decr = 1;
    return ((Math.random()) * decr - decr);
  }, []);

  useCursor(selected);

  return (
    <group>
      <mesh position={[0, randomZposition - 0.5, 0]} >
        <OrbitDisk size={distanceXY.x} opacity={0.1} positionYoffset={0} />
        {/* <Circle args={[distanceXY.x, 64]}>
          <meshBasicMaterial side={THREE.DoubleSide} transparent={true} opacity={0.1} depthWrite={false}>
            <GradientTexture
              stops={[0, 0.5, 1]}
              colors={['yellow', 'purple', 'blue']}
              size={1024}
              width={1024}
              type={GradientType.Radial}
              innerCircleRadius={0}
              outerCircleRadius={'auto'}
              // blending={THREE.CustomBlending}
              // bleding={THREE.AdditiveBlending}
              // blendMode={THREE.MultiplyBlending}
            />
          </meshBasicMaterial>
        </Circle> */}
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
