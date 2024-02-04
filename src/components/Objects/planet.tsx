import { useEffect, useMemo, useRef } from "react";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import {
  calculateRelativeDistance,
  calculateRelativeScale,
  degreesToRadians,
} from "../../utils/calculations";
import * as THREE from "three";
import { PlanetHUDComponent } from "../HUD/hud";
import { Line, Sphere, Trail } from "@react-three/drei";
import { ObjectEllipse } from "../HUD/ellipsis";

export const PlanetComponent = ({ planetName, params, planetTexture }) => {
  const planetSize = calculateRelativeScale(
    params.volumetricMeanRadiusKm,
    useSystemStore.getState().objectsRelativeScale
  );

  const planetRef = useRef();

  useEffect(() => {
    const unsubscribe = useSolarSystemStore.subscribe(
      (state) => {
        planetRef.current.position.copy(state.properties[planetName]?.position);
        planetRef.current.rotation.y = (state.properties[planetName]?.rotation.y);
      },
      (state) => state.properties[planetName] // This function selects which part of the state to subscribe to
    );
    return unsubscribe;
  }, []);

  return (
    <>
      <PlanetHUDComponent planetName={planetName} planetSize={planetSize} />
      <group>
        <ObjectEllipse params={params} />
        <group ref={planetRef} rotation={[0, 0, 0]}>
          <Trail
            local
            width={planetSize * 100}
            length={5}
            color={"white"}
            attenuation={(t) => t * t}
            target={planetRef}
          />

          {/* <group>
                  {moons.map((moon, index) => {
                    return <CosmicSphere key={index} planetsPositionCollection={planetsPositionCollection} {...moon} />;
                  } )}
                </group> */}
          <Sphere
            args={[planetSize]}
            onClick={() => {
              // console.log("clicked on planet", planetName);
              useSystemStore.getState().updateSystemSettings({ activeObjectName: planetName });
            }}
          >
            <meshStandardMaterial map={planetTexture} />
          </Sphere>
          {/* </group> */}
        </group>
      </group>
    </>
  );
};
