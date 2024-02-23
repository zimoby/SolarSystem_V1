import { OrbitControls, PerspectiveCamera, Stats, useKeyboardControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
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
  const orbitControlsRef = useRef<OrbitControls>(null);
  

  useEffect(() => {
    const unsubscribeSolarPositions = useSolarPositionsStore.subscribe((state) => {
      const newPosition = state.properties[useSolarStore.getState().activeObjectName]?.position;
      currentPositionRef.current = newPosition as THREE.Vector3 | undefined;
    });

    return () => {
      unsubscribeSolarPositions();
    };
  }, []);

  // console.log("orbitControlsRef", orbitControlsRef);

  useFrame(() => {

    
    if (currentPositionRef.current) {
      // const desiredOffset = new Vector3(0, 10, -30);
      // const targetPosition = currentPositionRef.current;
      // const desiredPosition = targetPosition.clone().add(desiredOffset);
      // camera.position.lerp(desiredPosition, 0.1);
      // camera.lookAt(targetPosition);

      
      // const targetPosition = currentPositionRef.current;
      // const controls = orbitControlsRef.current;
      // controls.target.set(targetPosition.x, targetPosition.y, targetPosition.z);
      // // controls.position0.set(targetPosition.x, targetPosition.y,  targetPosition.z);


      // controls.update();



      // camera.position.lerp(desiredPosition, 0.1);
      camera.lookAt(currentPositionRef.current.x, currentPositionRef.current.y, currentPositionRef.current.z);
      // camera.lookAt(targetPosition);

      // camera.position.set(currentPositionRef.current.x, currentPositionRef.current.y, currentPositionRef.current.z + cameraDistance);
      // camera.position.set(currentPositionRef.current.x + cameraPosition.x, currentPositionRef.current.y + cameraPosition.y, currentPositionRef.current.z + cameraPosition.z);
    }
  });

  return (
    <>
      <PerspectiveCamera  makeDefault position={[0, cameraDistance, cameraDistance * 2]} fov={10}  />
      <OrbitControls 
        ref={orbitControlsRef}
        dampingFactor={0.3}
        rotateSpeed={0.5}
      />
    </>
  );
};
