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

export const PlanetComponent = ({ planetName, params, planetTexture = null }) => {
  const planetSize = calculateRelativeScale(
    params.volumetricMeanRadiusKm,
    useSystemStore.getState().objectsRelativeScale
  );

  // const objectsDistance = useRef(useSystemStore.getState().objectsDistance);
  const typeOfObject = "planet";
  // const planetDistance = useMemo(() => { calculateRelativeDistance( params.semimajorAxis10_6Km, objectsDistance.current);
  // }, [params.semimajorAxis10_6Km]);

  // console.log("planetName", planetName, params);

  const moons = useMemo(() => {
    // if planetName === moonName, take the data 
    const takeMoons = Object.keys(useSolarSystemStore.getState().celestialBodies.moons).filter((moonName) => {
      return useSolarSystemStore.getState().celestialBodies.moons[moonName].type === planetName;
    } ).map((moonName) => {
      const moonData = useSolarSystemStore.getState().celestialBodies.moons[moonName];
      return {
        ...moonData,
        name: moonName,
      }
    } );

    return takeMoons;
   }, [planetName]);

  const planetRef = useRef();
  // const planetPositionRef = useRef();
  const [selected, setSelected] = useState(false);

  // console.log("moons", moons);


  useFrame(() => {
    const state = useSolarSystemStore.getState();
    planetRef.current.position.copy(state.properties[planetName]?.position);
    // planetRef.current.rotation.y = state.properties[planetName]?.rotation.y;
  });

  return (
    <>
      <PlanetHUDComponent planetName={planetName} planetSize={planetSize} />
      <group>
        <ObjectEllipse params={params} name={planetName} objSelected={selected} typeOfObject={typeOfObject} />
        <Trail
          local
          width={planetSize * 100}
          length={5}
          color={"white"}
          attenuation={(t) => t * t}
          target={planetRef}
        />
        <group ref={planetRef} rotation={[0, 0, 0]}>
          <group>
            {moons.map((moon, index) => {
              return (
                <PlanetComponent
                  key={index}
                  planetName={moon.name}
                  params={moon}
                  planetTexture={planetTexture}
                />
              ); 
            } )}
          </group>
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
