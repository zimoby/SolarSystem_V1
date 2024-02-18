import { useMemo, useRef, useState } from "react";
import { useSolarStore } from "../../store/systemStore";
import {
  degreesToRadians,
} from "../../utils/calculations";
import * as THREE from "three";
import { Line, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { OrbitDisk } from "../Objects/disk";
import { ObjectsAdditionalDataT } from "../../types";

type ObjectEllipseProps = {
  params: ObjectsAdditionalDataT;
  name: string;
  color?: THREE.Color | string;
  opacity?: number;
  type?: string;
};

export const ObjectEllipse: React.FC<ObjectEllipseProps> = ({ params, name, color = "grey", opacity = 1, type}) => {
  const [selected, setSelected] = useState(false);
  const distanceXY = useSolarStore((state) => state.additionalProperties[name]?.distanceXY) || { x: 0, y: 0 };
  const orbitAngleOffset = useSolarStore((state) => state.orbitAngleOffset);
  const planetsInitialized = useSolarStore((state) => state.planetsInitialized);

  const dashOffsetRef = useRef<THREE.Line>();
  // console.log("ObjectEllipse", params.orbitInclinationDeg);
  color = "white"

  // console.log("ObjectEllipse", name, params.orbitInclinationDeg);

  const planetInclination = degreesToRadians( (params.orbitInclinationDeg ?? 0) + orbitAngleOffset );

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

  // useCursor(selected);

  useFrame((state) => {
    if (!planetsInitialized) { return; }

    const time = state.clock.getElapsedTime() * Math.PI * 2;
    if (dashOffsetRef.current) {
      // @ts-expect-error wrong use of dashOffset
      dashOffsetRef.current.material.dashOffset = -(time) % (Math.PI * 2);
    }
  }); 

  return (
    <group>
      <mesh position={[0, randomZposition - 0.5, 0]} >
        <OrbitDisk size={distanceXY.x} opacity={0.1} positionYoffset={0} />
      </mesh>
      <group onPointerOver={() => setSelected(true)} onPointerLeave={() => setSelected(false)}>
        <mesh rotation-x={Math.PI / 2}>
          <Line
            // @ts-expect-error i'm tired of this
            ref={dashOffsetRef}
            position={[0, 0, 0]}
            points={pointsDependOnInclination}
            color={!selected ? color : "yellow"}
            lineWidth={1}
            transparent={true}
            opacity={opacity / 2}
            dashed={true}
            dashSize={5}
            dashScale={30}
          />
        </mesh>
        <mesh rotation-x={Math.PI / 2 + planetInclination}>
          <Line
            position={[0, 0, 0]} // (params.anchorXYOffset?.y ?? 0)
            points={points}
            color={!selected ? color : "yellow"}
            lineWidth={1}
            transparent={true}
            opacity={opacity}
            dashed={type === "moons"}
            dashSize={0.3}
            dashScale={10}
          />
        </mesh>
      </group>
    </group>
  );
};
