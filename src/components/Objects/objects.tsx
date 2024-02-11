import { useEffect, useMemo, useRef, useState } from "react";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import {
  calculateRelativeScale,
} from "../../utils/calculations";
import * as THREE from "three";
import { PlanetHUDComponent } from "../HUD/hud";
import { Circle, Line, Point, PointMaterial, Points, Sphere, Trail } from "@react-three/drei";
import { ObjectEllipse } from "../HUD/ellipsis";
import { useFrame, useThree } from "@react-three/fiber";
import { planetsScaleFactor } from "../../data/solarSystemData";

const ObjectsComponent = ({ planetName, params, planetTexture = null }) => {
  const planetSize = calculateRelativeScale(
    params.volumetricMeanRadiusKm,
    useSystemStore.getState().objectsRelativeScale
  );

  const [selected, setSelected] = useState(false);

  const objectRef = useRef();

  useFrame(() => {
    // planetRef.current.position.copy(useSolarSystemStore.getState().properties[planetName]?.position);
    if (objectRef.current) {
      objectRef.current.position.copy(useSolarSystemStore.getState().properties[planetName]?.position);
    }
    // objectRef.current.rotation.y = state.properties[planetName]?.rotation.y;
  });

  const typeOfObject = "object";

  return (
    <>
      <PlanetHUDComponent params={params} planetName={planetName} planetSize={planetSize} extendData={false} typeOfObject={typeOfObject} />
      <ObjectEllipse params={params} name={planetName} objSelected={selected} color={params.color} opacity={0.3} />
      <group ref={objectRef}>
        <Points position={[0, 0, 0]}>
          <PointMaterial color={"white"} size={0.5} />
          <Point position={[0, 0, 0]} />
        </Points>
        {/* <Sphere args={[planetSize]} position={[0, 0, 0]}>
          <meshStandardMaterial attach="material" color={params.color} />
        </Sphere> */}
        {/* <Point position={[0, 0, 0]}>
          <PointMaterial color={"white"} />
        </Point> */}
        {/* <Trail
          local
          width={planetSize * 100}
          length={5}
          color={"white"}
          attenuation={(t) => t * t}
          target={objectRef}
        /> */}
        {/* <group ref={objectRef} rotation={[0, 0, 0]}>
          <Sphere args={[0.4]} position={[0, 0, 0]}>
            <meshStandardMaterial attach="material" color={randomColor} />
          </Sphere>
        </group> */}
      </group>
    </>
  );
};

export default ObjectsComponent;
