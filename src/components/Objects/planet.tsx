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

export const PlanetComponent = ({ planetName, params, planetTexture }) => {
  const planetSize = calculateRelativeScale(
    params.volumetricMeanRadiusKm,
    useSystemStore.getState().objectsRelativeScale
  );

  const planetDistance = calculateRelativeDistance(
    params.semimajorAxis10_6Km,
    useSystemStore.getState().objectsDistance
  );

  const planetInclination = degreesToRadians(
    params.orbitInclinationDeg + useSystemStore.getState().orbitAngleOffset
  );

  // console.log("planetDistance", planetDistance);

  const planetRef = useRef();
  // const planetRotationRef = useRef();

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
      <PlanetHUDComponent planetName={planetName} planetSize={planetSize} />
      <group>
        {true && (
          <group>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <Line
                points={pointsDependOnInclination}
                color={"white"}
                lineWidth={1}
                transparent={true}
                opacity={0.2}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2 + planetInclination, 0, 0]}>
              <Line points={points} color={"white"} lineWidth={1} />
            </mesh>
          </group>
        )}
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
