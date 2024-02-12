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
  const { solarScale, objectsRelativeScale, timeSpeed } = useSystemStore.getState();

  const sunSize = (sunData?.volumetricMeanRadiusKm ?? 0.1) / starsScaleFactor * solarScale;
  const calculatedSunSize = calculateRelativeScale(sunSize, objectsRelativeScale);

  const sunRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const timeSec = time * Math.PI * 2;
    if (sunRef.current) {
      sunRef.current.rotation.y = calculateObjectsRotation(timeSec, sunData?.siderealRotationPeriodHrs || 100, timeSpeed);
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
