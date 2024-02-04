import { useEffect, useMemo, useRef, useState } from "react";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import {
  calculateRelativeDistance,
  calculateRelativeScale,
  degreesToRadians,
} from "../../utils/calculations";
import * as THREE from "three";
import { Line } from "@react-three/drei";


export const ObjectEllipse = ({ params, name, objSelected }) => {
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    // if (objSelected) {
      setSelected(objSelected);
    // }
  }, [objSelected]);

  // const activeObjectName = useSystemStore(state => state.activeObjectName);

  // if 

  // console.log("params", params);

  const planetDistance = calculateRelativeDistance(
    params.semimajorAxis10_6Km,
    useSystemStore.getState().objectsDistance
  );

  const planetInclination = degreesToRadians(
    params.orbitInclinationDeg + useSystemStore.getState().orbitAngleOffset
  );

  const points = useMemo(
    () =>
      new THREE.EllipseCurve(0, 0, planetDistance, planetDistance, 0, Math.PI * 2, false).getPoints(
        64 * 3
      ),
    [planetDistance]
  );

  const pointsDependOnInclination = useMemo(() => {
    const ellipseSize = planetDistance * Math.cos(planetInclination);
    return new THREE.EllipseCurve(
      0,
      0,
      planetDistance,
      ellipseSize,
      0,
      Math.PI * 2,
      false
    ).getPoints(64);
  }, [planetDistance, planetInclination]);

  return (
    <>
      <group onPointerOver={() => setSelected(true)} onPointerLeave={() => setSelected(objSelected || false)}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <Line
            points={pointsDependOnInclination}
            color={!selected ? "grey" : "yellow"}
            lineWidth={1}
            transparent={true}
            opacity={0.2}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2 + planetInclination, 0, 0]}>
          <Line points={points} color={!selected ? "grey" : "yellow"} lineWidth={1} />
        </mesh>
      </group>
    </>
  );
};
