import { OrbitControls, PerspectiveCamera, Stats, useKeyboardControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useSolarStore, useSolarPositionsStore } from "../../store/systemStore";
import { Controls } from "../../types";
import { planetsNamesOrder } from "../../data/solarSystemData";
import { useFrame, useThree } from "@react-three/fiber";
import { updateActiveName } from "../../hooks/storeProcessing";
import { Vector3 } from "three";

export const AppStatsPerformance = () => {
  return (
    <group>
      <Stats />
      {/* <Perf position="bottom-left" /> */}
    </group>
  );
};

export const KeyboardInit = () => {

  const rightPressed = useKeyboardControls<Controls>(state => state.right);
  const leftPressed = useKeyboardControls<Controls>(state => state.left);

  const activeObjectName = useSolarStore.getState().activeObjectName;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const planetsWithSun = ["sun", ...planetsNamesOrder];

  useEffect(() => {
    if (!rightPressed && !leftPressed) { return; }
    const findActivePlanet = planetsWithSun.findIndex((planetName) => planetName === activeObjectName);
    if (rightPressed) {
      updateActiveName(planetsWithSun[(findActivePlanet + 1) % planetsWithSun.length]);
    } else if (leftPressed) {
      updateActiveName(planetsWithSun[(findActivePlanet - 1 + planetsWithSun.length) % planetsWithSun.length]);
    }
  }, [rightPressed, leftPressed, activeObjectName, planetsWithSun]);

  return <></>;
}

export const ControlComponent = () => {
  const cameraDistance = 100;

  const { camera } = useThree();
  const currentPositionRef = useRef<THREE.Vector3 | undefined>();
  const orbitControlsRef = useRef(null);
  const currentObjectName = useSolarStore((state) => state.activeObjectName);

  // console.log("ControlComponent", {currentObjectName, additionalData});
  
  useEffect(() => {
    const unsubscribeSolarPositions = useSolarPositionsStore.subscribe((state) => {
      const newPosition = state.properties[useSolarStore.getState().activeObjectName]?.position;
      // console.log("ControlComponent", {newPosition});
      currentPositionRef.current = newPosition as Vector3 | undefined;
    });

    return () => {
      unsubscribeSolarPositions();
    };
  }, []);

  useEffect(() => {
    // console.log("ControlComponent", {currentObjectName, additionalData});
    if (currentObjectName !== "sun" && currentPositionRef.current) {
      const newPosition = useSolarPositionsStore.getState().properties[currentObjectName]?.position as Vector3;
      const scale = useSolarStore.getState().additionalProperties[currentObjectName].scale || 1;
      // console.log("ControlComponent", {currentObjectName, additionalData}, newPosition); 
      camera.position.set(newPosition.x + 30 * scale, newPosition.y + 2 * scale, newPosition.z + 30 * scale);
    }
  }, [camera.position, currentObjectName]);


  useFrame(() => {
    if (currentPositionRef.current && orbitControlsRef.current) {
      const controls = orbitControlsRef.current;
      // console.log("ControlComponent", {controls});
      // @ts-expect-error tyred of typescript
      controls.target.set(currentPositionRef.current.x, currentPositionRef.current.y, currentPositionRef.current.z);
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, cameraDistance, cameraDistance * 2]} fov={10}  />
      <OrbitControls 
        ref={orbitControlsRef}
        dampingFactor={0.3}
        rotateSpeed={0.5}
        enablePan={true}
      />
    </>
  );
};
