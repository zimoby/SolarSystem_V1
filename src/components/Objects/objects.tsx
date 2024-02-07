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
import { useThree } from "@react-three/fiber";
import { planetsScaleFactor } from "../../data/solarSystemData";

export const ObjectsComponent = ({ planetName, params, planetTexture = null }) => {
  const planetSize = calculateRelativeScale(
    params.volumetricMeanRadiusKm,
    useSystemStore.getState().objectsRelativeScale
  );

  const planetRef = useRef();
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    const unsubscribe = useSolarSystemStore.subscribe(
      (state) => {
        planetRef.current.position.copy(state.properties[planetName]?.position);
        planetRef.current.rotation.y = (state.properties[planetName]?.rotation.y);
        // planetPositionRef.current.position.copy(state.properties[planetName]?.position);
      },
      (state) => state.properties[planetName] // This function selects which part of the state to subscribe to
    );
    return unsubscribe;
  }, []);

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
          target={planetRef}
        /> */}
        <group ref={planetRef} rotation={[0, 0, 0]}>
        </group>
      </group>
    </>
  );
};
