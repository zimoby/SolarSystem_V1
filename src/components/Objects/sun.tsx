import { Circle, GradientTexture, GradientType, Sphere, useTexture } from "@react-three/drei";
import sunTexture from "../../assets/2k_sun.jpg";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import { calculateObjectsRotation, calculateRelativeScale } from "../../utils/calculations";
import { InfoAboutObject } from "../HUD/hud";
import { starsScaleFactor } from "../../data/solarSystemData";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { updateActiveName } from "../../hooks/storeProcessing";
import { AdditiveBlending, DoubleSide, Group } from "three";

export const SunComponent = () => {
  const createSunTexture = useTexture(sunTexture);
  const sunData = useSolarSystemStore((state) => state.celestialBodies.stars.sun);
  
  const { sunInitialized, objectsRelativeScale, timeOffset } = useSystemStore();
  // console.log("sunData", sunData?.volumetricMeanRadiusKm);
  const sunSize = (sunData?.volumetricMeanRadiusKm ?? 0.1) / starsScaleFactor;

  const calculatedSunSize = useMemo(() => {
    if (!sunInitialized) { return 0.1; }
    return calculateRelativeScale(sunSize, objectsRelativeScale, "sun")
  }, [sunInitialized, sunSize, objectsRelativeScale]);

  const sunRef = useRef<THREE.Object3D>(null);
  const sunOreolRef = useRef<Group>(null);

  const { camera } = useThree();

  // console.log("sunData", sunData);

  useEffect(() => {
    if (!sunInitialized) {
      console.log("Sun init");
      useSystemStore.getState().updateSystemSettings({ sunInitialized: true });
    }
  }, [sunInitialized]);

  useFrame((state) => {
    if (!sunData || !sunInitialized) { return; }

    const time = state.clock.getElapsedTime();
    const timeSec = time * Math.PI * 2;
    if (sunRef.current) {
      sunRef.current.rotation.y = calculateObjectsRotation(timeSec, sunData?.siderealRotationPeriodHrs || 100, timeOffset ?? 0);
      // sunRef.current.position.set(0, 0, 0);
    }
    if (sunOreolRef.current) {
      sunOreolRef.current.lookAt(camera.position);
    }
  });

  return (
    <group position={[0,0,0]}>
      <InfoAboutObject params={{ name: "sun" }} />
      {/* <pointLight position={[0, 5, 0]} intensity={1} distance={500} /> */}
      <Sphere
        // @ts-expect-error tired of typescript
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
              // blending={THREE.CustomBlending}
              // bleding={THREE.AdditiveBlending}
              // blendMode={THREE.MultiplyBlending}
            />
          </meshBasicMaterial>
        </Circle>
      </group>
    </group>
  );
};
