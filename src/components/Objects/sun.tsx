import { Sphere, useTexture } from "@react-three/drei";
import sunTexture from "../../assets/2k_sun.jpg";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import { calculateRelativeScale } from "../../utils/calculations";
import { InfoAboutObject } from "../HUD/hud";
import { dayInSeconds, objectsRotationSpeed, starsScaleFactor, yearInSeconds } from "../../data/solarSystemData";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export const SunComponent = () => {
  const createSunTexture = useTexture(sunTexture);
  const sunData = useSolarSystemStore((state) => state.celestialBodies.stars.sun);
  const relativeScale = useSystemStore.getState().objectsRelativeScale;
  const sunSize = sunData?.volumetricMeanRadiusKm / starsScaleFactor ?? 0.1;
  const calculatedSunSize = calculateRelativeScale(sunSize, relativeScale);

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

  useFrame((_, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y = (sunRef.current.rotation.y + delta * Math.PI * 2 / dayInSeconds / sunData.siderealRotationPeriodHrs * objectsRotationSpeed * useSystemStore.getState().timeSpeed ) % (Math.PI * 2); // 
    }
  });


  return (
    <group>
      <InfoAboutObject position={[0, 0, 0]} offset={0.1} params={{ name: "sun" }} />
      <pointLight position={[0, 0, 0]} intensity={1} distance={500} />
      <Sphere
        ref={sunRef}
        args={[calculatedSunSize]}
        onClick={() => {
          useSystemStore.getState().updateSystemSettings({ activeObjectName: "sun" });
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
