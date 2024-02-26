import { useMemo, useRef, useState } from "react";
import { useSolarPositionsStore, useSolarStore } from "../../store/systemStore";
import {
  degreesToRadians,
} from "../../utils/calculations";
import * as THREE from "three";
import { Line, Ring } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitDisk } from "../Objects/disk";
import { ObjectEllipseProps } from "../../types";
import { LineMaterial } from "three-stdlib";

export const ObjectEllipse: React.FC<ObjectEllipseProps> = ({
  params,
  name,
  color = "grey",
  opacity = 0.75,
  type,
  extraRotation = 0,
}) => {
  const [selected, setSelected] = useState(false);

  const distanceXY = useSolarStore((state) => state.additionalProperties[name]?.distanceXY) || { x: 0, y: 0 };
  const objData = useSolarStore((state) => state.additionalProperties[name]);
  const orbitAngleOffset = useSolarStore((state) => state.orbitAngleOffset);
  const planetsInitialized = useSolarStore((state) => state.planetsInitialized);
  const orbitPathDetalization = useSolarStore((state) => state.orbitPathDetalization);
  const activeObject = useSolarStore((state) => state.activeObjectName);

  const disabledObjects = useSolarStore((state) => state.disableRandomObjects);

  const dashOffsetRef = useRef<THREE.Line>();
  const orbitLineRef = useRef<THREE.Line>();
  const traectoryRingRef = useRef<THREE.Mesh>();
  color = "white"

  const planetInclination = degreesToRadians( (params.orbitInclinationDeg ?? 0) + orbitAngleOffset );

  // const anchorXYOffset = (params.anchorXYOffset?.y ?? 0) ;

  const {camera} = useThree();

  useFrame((state) => {
    if (!planetsInitialized) { return; }

    const time = state.clock.getElapsedTime() * Math.PI * 2;
    if (dashOffsetRef.current) {
      // @ts-expect-error wrong use of dashOffset
      dashOffsetRef.current.material.dashOffset = -(time) % (Math.PI * 2);
    }
    
    const objectPosition = useSolarPositionsStore.getState().properties[name]?.position as THREE.Vector3;
    const activeScale = useSolarStore.getState().additionalProperties[name]?.scale;
    const distance = camera.position.distanceTo(objectPosition);

    const minDistance = 2 * (1 + activeScale * 10);
    const maxDistance = 5 * (1 + activeScale * 10);

    let distRelativeOpacity = 1;
    if (distance <= maxDistance && distance >= minDistance) {
      distRelativeOpacity = (distance - minDistance) / (maxDistance - minDistance);
    } else if (distance < minDistance) {
      distRelativeOpacity = 0;
    }
    const relativeOpacity = Math.min(Math.max(distRelativeOpacity, 0), 1) * (distRelativeOpacity);

    if (dashOffsetRef.current && orbitLineRef.current) {
      const material = dashOffsetRef.current.material as LineMaterial;
      material.dashScale = (1 / distance) * 2000;

      if (activeObject === name) {
        material.opacity = relativeOpacity / 2;
        (orbitLineRef.current.material as LineMaterial).opacity = relativeOpacity;
      } else {
        material.opacity = opacity / 2;
        (orbitLineRef.current.material as LineMaterial).opacity = opacity;
      }
    }

    if (traectoryRingRef.current) {
      // console.log(traectoryRingRef.current)
      traectoryRingRef.current.material.opacity = selected ? 0.2 : relativeOpacity / 30;
    }

  });


  const points = useMemo(() => 
    new THREE.EllipseCurve(0, 0, distanceXY.x, distanceXY.y, 0, Math.PI * 2, false).getPoints(orbitPathDetalization),
    [distanceXY.x, distanceXY.y, orbitPathDetalization]
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
    ).getPoints(orbitPathDetalization);
  }, [distanceXY.x, distanceXY.y, orbitPathDetalization, planetInclination]);

  const SelectedTube = useMemo(() => {
    const relScale = objData.scale * 0.3;
    return (
      <Ring
        // @ts-expect-error tired of typescript
        ref={traectoryRingRef}
        args={[(distanceXY.x - 1 * relScale), (distanceXY.y + 1 * relScale), 128, 1, 0, Math.PI * 2]}
        position={[0, 0, 0]}
        rotation-x={Math.PI / 2}
      >
        <meshBasicMaterial
          side={THREE.DoubleSide}
          transparent={true}
          opacity={!selected ? 0.03 : 0.2}
          color={!selected ? color : "red"}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Ring>
    )
  }, [color, distanceXY.x, distanceXY.y, objData.scale, selected]);

  const randomZposition = useMemo(() => {
    const decr = 1;
    return ((Math.random()) * decr - decr);
  }, []);


  return (
    <group>
      <group rotation={[-extraRotation,0,0]} >
        <mesh position={[0, randomZposition - 0.5, 0]}>
          <OrbitDisk size={distanceXY.x} opacity={disabledObjects ? 0.2 : 0.1} positionYoffset={0} />
        </mesh>
      </group>
      <group
        rotation={[0,0,0]}
        onPointerOver={() => setSelected(true)} onPointerLeave={() => setSelected(false)}
      >
        {type === "planets" && SelectedTube}
        <mesh rotation-x={Math.PI / 2}>
        {/* <mesh rotation-x={Math.PI / 2 - extraRotation}> */}
          <Line
            // @ts-expect-error i'm tired of this
            ref={dashOffsetRef}
            name="dashOffsetLine"
            position={[0, 0, 0]}
            points={pointsDependOnInclination}
            color={!selected ? color : "yellow"}
            lineWidth={1}
            transparent={true}
            dashed={true}
            dashSize={5}
            dashScale={30}
          />
        </mesh>
        <mesh rotation-x={Math.PI / 2 + planetInclination}>
          <Line
            // @ts-expect-error i'm tired of this
            ref={orbitLineRef}
            position={[0, 0, 0]} // (params.anchorXYOffset?.y ?? 0)
            points={points}
            color={!selected ? color : "yellow"}
            lineWidth={!selected ? 1 : 2}
            transparent={true}
          />
        </mesh>
      </group>
    </group>
  );
};
