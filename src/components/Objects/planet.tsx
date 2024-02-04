import { useEffect, useMemo, useRef, useState } from "react";
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
  const [selected, setSelected] = useState(false);

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
        <ObjectEllipse params={params} name={planetName} objSelected={selected} />
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
              {/* create circle if sphere is selected */}
              {selected && (
                <mesh rotation={[0, Math.PI / 2, 0]}>
                  <Line
                    points={new THREE.EllipseCurve(0, 0, planetSize * 1.5, planetSize * 1.5, 0, Math.PI * 2, false).getPoints(64)}
                    color={"yellow"}
                    lineWidth={1}
                  />
                </mesh>
              )}
          <Sphere
            args={[planetSize]}
            onClick={() => {
              // console.log("clicked on planet", planetName);
              useSystemStore.getState().updateSystemSettings({ activeObjectName: planetName });
            }}
            onPointerOver={() => setSelected(true)}
            onPointerOut={() => setSelected(false)}
          >
            <meshStandardMaterial map={planetTexture} />
          </Sphere>
          {/* </group> */}
        </group>
      </group>
    </>
  );
};
