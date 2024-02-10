import { Sphere, useTexture } from "@react-three/drei";
import sunTexture from "../../assets/2k_sun.jpg";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import { calculateObjectsRotation, calculateRelativeScale } from "../../utils/calculations";
import { InfoAboutObject } from "../HUD/hud";
import { dayInSeconds, objectsRotationSpeed, starsScaleFactor, yearInSeconds } from "../../data/solarSystemData";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { updateActiveName } from "../../hooks/storeProcessing";

export const SunComponent = () => {
  const createSunTexture = useTexture(sunTexture);
  const sunData = useSolarSystemStore((state) => state.celestialBodies.stars.sun);
  const { solarScale, objectsRelativeScale } = useSystemStore.getState();

  
  const sunSize = (sunData?.volumetricMeanRadiusKm ?? 0.1) / starsScaleFactor * solarScale;
  // console.log("sunData", {sunData, sunSize, solarScale, objectsRelativeScale} );
  const calculatedSunSize = calculateRelativeScale(sunSize, objectsRelativeScale);

  // console.log("sunData", sunSize);

  const sunRef = useRef();
  // const planetRef = useRef();
  // // const planetRotationRef = useRef();

  // useEffect(() => {
  //   const unsubscribe = useSolarSystemStore.subscribe(
  //     (state) => {
  //       planetRef.current.position.copy(state.properties[planetName]?.position);
  //       planetRef.current.rotation.y = (state.properties[planetName]?.rotation.y);
  //     },
  //     (state) => state.properties[planetName] // This function selects which part of the state to subscribe to
  //   );
  //   return unsubscribe;
  // }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const timeSec = time * Math.PI * 2;
    if (sunRef.current) {
      sunRef.current.rotation.y = calculateObjectsRotation(timeSec, sunData?.siderealRotationPeriodHrs || 100);
      sunRef.current.position.set(0, 0, 0);
    }
  });


  return (
    <group>
      <InfoAboutObject position={[0, calculatedSunSize, 0]} offset={0.1} params={{ name: "sun" }} />
      <pointLight position={[0, 0, 0]} intensity={1} distance={500} />
      <Sphere
        ref={sunRef}
        args={[calculatedSunSize]}
        onClick={() => {
          updateActiveName("sun");
        }}
      >
        <meshStandardMaterial
          map={createSunTexture}
          emissive="orange"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </Sphere>
    </group>
  );
};
