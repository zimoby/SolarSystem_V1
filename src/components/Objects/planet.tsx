import { useEffect, useMemo, useRef, useState } from "react";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import {
  calculateObjectsRotation,
  calculateRelativeScale,
} from "../../utils/calculations";
import * as THREE from "three";
import { PlanetHUDComponent } from "../HUD/hud";
import { Circle, Line, Sparkles, Sphere, Trail } from "@react-three/drei";
import { ObjectEllipse } from "../HUD/ellipsis";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { dayInSeconds, objectsRotationSpeed, planetsScaleFactor } from "../../data/solarSystemData";
import { updateActiveName } from "../../hooks/storeProcessing";

const PlanetComponent = ({ planetName, params, planetTexture = null }) => {
  const {
    solarScale,
    objectsRelativeScale,
    timeSpeed
  } = useSystemStore.getState();

  const {
    siderealRotationPeriodHrs
  } = useSolarSystemStore.getState().celestialBodies.planets[planetName];
    
  const planetRef = useRef();
  const planetRotationRef = useRef();
  const [selected, setSelected] = useState(false);

  const typeOfObject = "planet";

  //--------- processings size

  const planetSize = useMemo(() => {
    return calculateRelativeScale(
      params.volumetricMeanRadiusKm ?? 0.1,
      objectsRelativeScale
    ) * solarScale;
  }, [params, solarScale, objectsRelativeScale]);

  const planetEllipseRotation = useMemo(() => {
    const curve = new THREE.EllipseCurve(
      0, 0,
      planetSize * 1.5, planetSize * 1.5,
      0, 2 * Math.PI,
      false,
      0
    );

    return curve.getPoints(64); // Adjust the number of points as needed
  }, [planetSize]);

  //--------- processings size

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

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    planetRef.current.position.copy(useSolarSystemStore.getState().properties[planetName]?.position);
    planetRotationRef.current.rotation.y = calculateObjectsRotation(time, siderealRotationPeriodHrs, timeSpeed);
  });

  return (
    <group>
      <PlanetHUDComponent planetName={planetName} planetSize={planetSize} />
      <ObjectEllipse params={params} name={planetName} objSelected={selected} typeOfObject={typeOfObject} />
      <Trail
        local
        width={planetSize * 100}
        length={5}
        color={"white"}
        attenuation={(t) => t * t}
        target={planetRef}
      />
      <group ref={planetRef}>
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
        {/* <Sphere
          key={planetName + "wireframe"}
          args={[planetSize * 1.5, 8, 8]}
          onClick={() => {
            updateActiveName(planetName);
          }}
          onPointerOver={() => setSelected(true)}
          onPointerOut={() => setSelected(false)}
        >
          <meshStandardMaterial wireframe transparent={true} opacity={0.1} />
        </Sphere> */}
        <group ref={planetRotationRef}>
          <mesh rotation-y={Math.PI / 2}>
            <Line
              points={planetEllipseRotation}
              color={"yellow"}
              lineWidth={1}
            />
          </mesh>

          <Sphere
            key={planetName}
            args={[planetSize]}
            onClick={() => {
              updateActiveName(planetName);
            }}
            onPointerOver={() => setSelected(true)}
            onPointerOut={() => setSelected(false)}
          >
            <meshStandardMaterial map={planetTexture} />
          </Sphere>

        </group>
      </group>
    </group>
  );
};

export default PlanetComponent;
