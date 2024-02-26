import { Circle, GradientTexture, GradientType, Sphere, useTexture } from "@react-three/drei";
import sunTexture from "../../assets/2k_sun.jpg";
import { useSolarStore } from "../../store/systemStore";
import { calculateObjectsRotation, calculateRelativeScale } from "../../utils/calculations";
import { InfoAboutObject } from "../HUD/hud";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { updateActiveName } from "../../hooks/storeProcessing";
import { AdditiveBlending, DoubleSide, Group } from "three";

export const SunComponent = () => {
  const DEV_MODE = useSolarStore((state) => state.DEV_MODE);
  const createSunTexture = useTexture(sunTexture);
  
  const sunData = useSolarStore((state) => state.celestialBodies.stars.sun);
  const sunInitialized = useSolarStore((state) => state.sunInitialized);
  const objectsRelativeScale = useSolarStore((state) => state.objectsRelativeScale);
  const objectsDistance = useSolarStore((state) => state.objectsDistance);
  const timeOffset = useSolarStore((state) => state.timeOffset);
  const updateSunInitialized = useSolarStore((state) => state.updateSystemSettings);

  const sunSize = (sunData?.volumetricMeanRadiusKm ?? 0.1);

  const calculatedSunSize = useMemo(() => {
    if (!sunInitialized) { return 0.1; }
    return calculateRelativeScale(sunSize, objectsRelativeScale, "sun")
  }, [sunInitialized, sunSize, objectsRelativeScale]);

  const sunRef = useRef<THREE.Object3D>(null);
  const sunOreolRef = useRef<Group>(null);

  const { camera } = useThree();

  useEffect(() => {
    if (!sunInitialized) {
      DEV_MODE && console.log("Sun init");
      updateSunInitialized({ sunInitialized: true });
    }
  }, [DEV_MODE, sunInitialized, updateSunInitialized]);

  useFrame((state) => {
    if (!sunData || !sunInitialized) { return; }

    const time = state.clock.getElapsedTime();
    const timeSec = time * Math.PI * 2;
    if (sunRef.current) {
      sunRef.current.rotation.y = calculateObjectsRotation(timeSec, sunData?.siderealRotationPeriodHrs || 100, timeOffset ?? 0);
    }
    if (sunOreolRef.current) {
      sunOreolRef.current.lookAt(camera.position);
    }
  });

  return (
    <group position={[0,0,0]} scale={[(Math.pow(objectsDistance,3)),(Math.pow(objectsDistance,3)),(Math.pow(objectsDistance,3))]}>
      <InfoAboutObject params={{ name: "sun" }} typeOfObject={"star"} />
      <Sphere
        // @ts-expect-error tired of typescript
        ref={sunRef}
        args={[calculatedSunSize, 128, 64]}
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
      <group position={[0, 0, 0]} rotation-x={0} ref={sunOreolRef}>
        <Circle args={[calculatedSunSize * 4, 64]}>
          <meshBasicMaterial side={DoubleSide} transparent={true} opacity={1} depthWrite={false} blending={AdditiveBlending}>
            <GradientTexture
              stops={[0, 0.3, 0.6]}
              colors={['yellow', '#000000', '#000000']}
              size={1024}
              width={1024}
              type={GradientType.Radial as never}
              innerCircleRadius={0}
              outerCircleRadius={'auto'}
            />
          </meshBasicMaterial>
        </Circle>
      </group>
    </group>
  );
};
