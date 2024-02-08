import { useEffect, useMemo, useRef, useState } from "react";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import {
  calculateRelativeDistance,
  calculateRelativeScale,
  degreesToRadians,
} from "../../utils/calculations";
import * as THREE from "three";
import { PlanetHUDComponent } from "../HUD/hud";
import { Circle, Line, Sphere, Trail } from "@react-three/drei";
import { ObjectEllipse } from "../HUD/ellipsis";
import { useFrame, useThree } from "@react-three/fiber";
import { planetsScaleFactor } from "../../data/solarSystemData";

export const ObjectsComponent = ({ planetName, params, planetTexture = null }) => {
  const planetSize = calculateRelativeScale(
    params.volumetricMeanRadiusKm,
    useSystemStore.getState().objectsRelativeScale
  );

  // console.log("planetName", planetName, params);

  // const objectRef = useRef();
  const [selected, setSelected] = useState(false);



  // useFrame(() => {
  //   const state = useSolarSystemStore.getState();
  //   objectRef.current.position.copy(state.properties[planetName]?.position);
  //   // objectRef.current.rotation.y = state.properties[planetName]?.rotation.y;
  // });

  const colors = ["red", "green", "blue", "yellow", "purple", "orange", "pink", "brown", "grey", "white"];
  const typeOfObject = "object";
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return (
    <>
      <PlanetHUDComponent planetName={planetName} planetSize={planetSize} extendData={false} typeOfObject={typeOfObject} />
      <group>
        <ObjectEllipse params={params} name={planetName} objSelected={selected} color={randomColor} opacity={0.3} />
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
