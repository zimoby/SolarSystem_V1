import { useEffect, useMemo, useRef, useState } from "react";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import {
  calculateObjectsRotation,
  calculateRelativeScale,
} from "../../utils/calculations";
import * as THREE from "three";
import { PlanetHUDComponent } from "../HUD/hud";
import { Circle, Html, Line, Sparkles, Sphere, Trail } from "@react-three/drei";
import { ObjectEllipse } from "../HUD/ellipsis";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { dayInSeconds, objectsRotationSpeed, planetsScaleFactor } from "../../data/solarSystemData";
import { updateActiveName } from "../../hooks/storeProcessing";

const filterParamsOnlyNumbers = (params) => {
  // return object with values that are numbers
  return Object.fromEntries(
    Object.entries(params).filter(([key, value]) => {
      return typeof value === "number";
    })
  );

}


const PlanetInfoCircles = ({ planetName, planetSize, params }) => {
  const filteredParams = filterParamsOnlyNumbers(params);
  // console.log("PlanetInfoCircles", planetSize, filteredParams);

  const normalizedValuesTo2MathPI = Object.keys(filteredParams).map((key) => {
    let circleValue = 0;
    switch (key) {
      case "orbitEccentricity":
        circleValue = filteredParams[key] * 10;
        // circleValue = filteredParams[key] * 10;
        break;
      case "orbitInclinationDeg":
        circleValue = filteredParams[key] * (2 * Math.PI) / 360;
        // circleValue = filteredParams[key] * (2 * Math.PI) / 360;
        break;
      case "semimajorAxis10_6Km":
        circleValue = (filteredParams[key] / 10) * 2 * Math.PI;
        // circleValue = (filteredParams[key] / 10) * 2 * Math.PI;
        break;
      case "siderealOrbitPeriodDays":
        circleValue = (filteredParams[key] / 10) * 2 * Math.PI;
        // circleValue = (filteredParams[key] / 10) * 2 * Math.PI;
        break;
      case "siderealRotationPeriodHrs":
        circleValue = (filteredParams[key] / 24) * 2 * Math.PI;
        // circleValue = (filteredParams[key] / 24) * 2 * Math.PI;
        break;
      default:
        circleValue = 0;
    }

    return {name: key, value: circleValue};
  });

  // create EllipseCurve for each value

  return (
    <group key={planetName + "hui-info"}>
      {normalizedValuesTo2MathPI.map((circle, index) => {
        const curve = new THREE.EllipseCurve(
          0, 0,
          planetSize + planetSize * (index + 1) * 0.2, planetSize + planetSize * (index + 1) * 0.2,
          // planetSize + (index + 1) / 15, planetSize + (index + 1) / 15,
          0, circle.value,
          false,
          0
        );

        const points = curve.getPoints(64); // Adjust the number of points as needed

        return (
          <group key={planetName + "hui-info" + index}>
            <Line
              key={index}
              points={points}
              color={"white"}
              lineWidth={2}
            />
            {/* <group>
              <Html position-x={planetSize + (index + 1) / 15}>
                <div className=" text-3xs leading-3 whitespace-nowrap select-none">
                  {circle.name}
                </div>
              </Html>
            </group> */}
          </group>
        );
      })}
    </group>
  );



  // return (
  //   <group>

  //   </group>
  // )
};

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
      planetSize * 1.15, planetSize * 1.15,
      0, 2 * Math.PI,
      false,
      0
    );

    return curve.getPoints(64); // Adjust the number of points as needed
  }, [planetSize]);

  const guiRef = useRef();

  //--------- processings size

  // const testCurveBuffer = useMemo(() => {
  //   const curve = new THREE.EllipseCurve(
  //     0, 0,
  //     planetSize * 1.2, planetSize * 1.2,
  //     0, params.siderealOrbitPeriodDays / 10,
  //     false,
  //     0
  //   );

  //   return curve.getPoints(32); // Adjust the number of points as needed
  // }, [planetSize]);

  const { camera } = useThree();

  // console.log("camera", camera);

  // -------

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

    guiRef.current.lookAt(camera.position);
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
        <mesh ref={guiRef}>
          <PlanetInfoCircles planetName={planetName} planetSize={planetSize} params={params} />
          {/* <Line
            points={testCurveBuffer}
            color={"white"}
            lineWidth={2}
          >
          </Line>
          <Html position-x={planetSize * 1.2}>
            <div className=" text-3xs leading-3 whitespace-nowrap">
              Orbit(d)
            </div>
          </Html> */}
        </mesh>
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
