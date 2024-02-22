import { OrbitControls, PerspectiveCamera, Stats, useKeyboardControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useEffect, useRef } from "react";
import { useSolarStore, useSolarPositionsStore } from "../../store/systemStore";
import { Controls } from "../../types";
import { planetsNamesOrder } from "../../data/solarSystemData";
import { useFrame, useThree } from "@react-three/fiber";
import { updateActiveName } from "../../hooks/storeProcessing";

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

  // console.log("rightPressed", rightPressed, leftPressed, activeObjectName);

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
  

  useEffect(() => {
    const unsubscribeSolarPositions = useSolarPositionsStore.subscribe((state) => {
      const newPosition = state.properties[useSolarStore.getState().activeObjectName]?.position;
      currentPositionRef.current = newPosition as THREE.Vector3 | undefined;
    });

    return () => {
      unsubscribeSolarPositions();
    };
  }, []);

  useFrame(() => {
    
    if (currentPositionRef.current) {
      camera.lookAt(currentPositionRef.current.x, currentPositionRef.current.y, currentPositionRef.current.z);
    }
  });

  return (
    <>
      <PerspectiveCamera  makeDefault position={[0, cameraDistance, cameraDistance * 2]} fov={10}  />
      <OrbitControls 
        // ref={controlRef}
        dampingFactor={0.3}
        rotateSpeed={0.5}
      />
    </>
  );
};
