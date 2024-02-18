import { OrbitControls, PerspectiveCamera, Stats, useKeyboardControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useEffect } from "react";
import { useSolarStore, useSolarPositionsStore } from "../../store/systemStore";
import { Controls } from "../../types";
import { planetsNamesOrder } from "../../data/solarSystemData";
import { useFrame, useThree } from "@react-three/fiber";
import { updateActiveName } from "../../hooks/storeProcessing";

export const AppStatsPerformance = () => {
  return (
    <group>
      <Stats />
      <Perf position="bottom-left" />
    </group>
  );
};

export const KeyboardInit = () => {

  const rightPressed = useKeyboardControls<Controls>(state => state.right);
  const leftPressed = useKeyboardControls<Controls>(state => state.left);

  const activeObjectName = useSolarStore(state => state.activeObjectName);

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

  useFrame(() => {
    const newPosition = useSolarPositionsStore.getState().properties[useSolarStore.getState().activeObjectName]?.position as THREE.Vector3 | undefined;
    if (newPosition) {
      camera.lookAt(newPosition.x, newPosition.y, newPosition.z);
    }
  });

  return (
    <>
      <PerspectiveCamera  makeDefault position={[0, cameraDistance, cameraDistance * 2]} fov={10}  />
      <OrbitControls 
        makeDefault
        dampingFactor={0.3}
        rotateSpeed={0.5}
      />
    </>
  );
};
