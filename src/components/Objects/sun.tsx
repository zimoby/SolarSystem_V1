import { Circle, GradientTexture, GradientType, Sphere, useTexture } from "@react-three/drei";
import sunTexture from "../../assets/2k_sun.jpg";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import { calculateObjectsRotation, calculateRelativeScale } from "../../utils/calculations";
import { InfoAboutObject } from "../HUD/hud";
import { dayInSeconds, objectsRotationSpeed, planetsScaleFactor, starsScaleFactor, yearInSeconds } from "../../data/solarSystemData";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { updateActiveName } from "../../hooks/storeProcessing";
import { AdditiveBlending, ConstantAlphaFactor, DoubleSide } from "three";

export const SunComponent = () => {
  const createSunTexture = useTexture(sunTexture);
  const sunData = useSolarSystemStore((state) => state.celestialBodies.stars.sun);
  const { solarScale, objectsRelativeScale, timeSpeed } = useSystemStore.getState();
  // console.log("sunData", sunData?.volumetricMeanRadiusKm);
  const sunSize = (sunData?.volumetricMeanRadiusKm ?? 0.1) / starsScaleFactor;
  const calculatedSunSize = calculateRelativeScale(sunSize, objectsRelativeScale, "sun");

  // console.log("sunData", calculatedSunSize);

  const sunRef = useRef();
  const sunOreolRef = useRef();

  const { camera } = useThree();

  // const calculateRelativeScale = useMemo(() => {
  //   return calculateRelativeScale(
  //     solarScale,
  //     objectsRelativeScale
  //   );
  // }, [objectsRelativeScale, solarScale]);


    // const planetSize = useMemo(() => {
    //   return calculateRelativeScale(
    //     params.volumetricMeanRadiusKm ?? 0.1,
    //     objectsRelativeScale
    //   ) * solarScale;

  // console.log("sunData", sunOreolRef);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const timeSec = time * Math.PI * 2;
    if (sunRef.current) {
      sunRef.current.rotation.y = calculateObjectsRotation(timeSec, sunData?.siderealRotationPeriodHrs || 100, timeSpeed);
      // sunRef.current.position.set(0, 0, 0);
      sunOreolRef.current.lookAt(camera.position);
    }
  });

  return (
    <group position={[0,0,0]}>
      <InfoAboutObject position={[0, 1, 0]} offset={0.1} params={{ name: "sun" }} />
      {/* <pointLight position={[0, 5, 0]} intensity={1} distance={500} /> */}
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
      <group position={[0, 0, 0]} rotation-x={0} ref={sunOreolRef}>
        <Circle args={[calculatedSunSize * 4, 64]}>
          <meshBasicMaterial side={DoubleSide} transparent={true} opacity={1} depthWrite={false} blending={AdditiveBlending}>
            <GradientTexture
              stops={[0, 0.3, 0.6]}
              colors={['yellow', '#000000', '#000000']}
              size={1024}
              width={1024}
              type={GradientType.Radial}
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
