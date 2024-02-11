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
    // ellipseCurve,

    rotVec3,
    solarScale,
    objectsRelativeScale
  } = useSystemStore.getState(); 

  const planetSize = useMemo(() => {
    return calculateRelativeScale(
      params.volumetricMeanRadiusKm ?? 0.1,
      objectsRelativeScale
    ) * solarScale;
  }, [params, solarScale, objectsRelativeScale]);

  // console.log("planetSize", planetSize, solarScale);

  const typeOfObject = "planet";

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
  const [selected, setSelected] = useState(false);

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

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const rotationSpeed = calculateObjectsRotation(time, useSolarSystemStore.getState().celestialBodies.planets[planetName].siderealRotationPeriodHrs);

    const newRotation = rotVec3.set(0, rotationSpeed, 0);

    planetRef.current.position.copy(useSolarSystemStore.getState().properties[planetName]?.position);
    planetRef.current.rotation.y = newRotation.y;
  });

  return (
    <>

        {/* <Sphere args={[1]} position={[0, 0, 0]}>
          <meshStandardMaterial map={planetTexture} />
        </Sphere> */}

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
        
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <Line
              points={planetEllipseRotation}
              color={"yellow"}
              lineWidth={1}
            />
          </mesh>
{/* 
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
          </Sphere> */}


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
    </>
  );
};

export default PlanetComponent;
