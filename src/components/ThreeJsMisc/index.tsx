import { OrbitControls, PerspectiveCamera, Stats, useKeyboardControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import { Controls } from "../../types";
import { planetsNamesOrder } from "../../data/solarSystemData";
import { useFrame, useThree } from "@react-three/fiber";
import { updateActiveName } from "../../hooks/storeProcessing";

export const AppStatsPerformance = () => {
  return (
    <>
      <Stats />
      <Perf position="bottom-left" />
    </>
  );
};

export const KeyboardInit = () => {

  const rightPressed = useKeyboardControls<Controls>(state => state.right);
  const leftPressed = useKeyboardControls<Controls>(state => state.left);

  const activeObjectName = useSystemStore.getState().activeObjectName;

  // console.log("rightPressed", rightPressed, leftPressed, activeObjectName);

  useEffect(() => {
    if (!rightPressed && !leftPressed) { return; }
    const findActivePlanet = planetsNamesOrder.findIndex((planetName) => planetName === activeObjectName);
    if (rightPressed) {
      updateActiveName(planetsNamesOrder[(findActivePlanet + 1) % planetsNamesOrder.length]);
    } else if (leftPressed) {
      updateActiveName(planetsNamesOrder[(findActivePlanet - 1 + planetsNamesOrder.length) % planetsNamesOrder.length]);
    }
  }, [rightPressed, leftPressed, activeObjectName]);

  return <></>;
}

export const ControlComponent = () => {

  const cameraDistance = 12;

  const refCamera = useRef();

  const lookAtVec = (new THREE.Vector3(0, 0, 0));
  const cameraVector = (new THREE.Vector3(0, 0, 0));

  const activeObjectName = useSystemStore.getState().activeObjectName;
  const activeObjectNameAct = useMemo(() => activeObjectName, [activeObjectName]);

  const { camera } = useThree();

  // console.log(camera)


  // const [statesUpdate, setStatesUpdate] = useState(0);

  // const activeObjectName = useSystemStore.getState().activeObjectName;
  // const activeItemPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  // // const activeItemPositionReclearIntervalf = useRef({ needsUpdate: false });
  // const activeItemPositionRec2 = useRef();

  // console.log("activeObjectName", activeObjectName);


  // useEffect(() => {
  //   const unsubscribe = useSolarSystemStore.subscribe(
  //     (state) => {
        

  //       const newPosition = state.properties[activeObjectNameAct]?.position;

  //       if (!newPosition) { return; }
  //       // lookAtVec.current.set(newPosition.x, newPosition.y, newPosition.z);
  //       // cameraVector.current.lerp(lookAtVec.current, 0.1);
  //       camera.lookAt(newPosition.x, newPosition.y, newPosition.z);
  //       camera.updateProjectionMatrix();

  //       // activeItemPositionRef.current = state.properties[activeObjectName]?.position;
  //       // console.log("activeItemPositionRef", activeItemPositionRef.current);
  //       // setStatesUpdate((prev) => prev + 1);
  //     },
  //     (state) => state.properties[activeObjectNameAct]
  //   );
  //   return unsubscribe;
  // }, [activeObjectNameAct, camera, cameraVector]);


  // useFrame((state) => {
  //   const newPosition = useSolarSystemStore.getState().properties[activeObjectNameAct]?.position;
  //   // if (newPosition) {
  //   //   refCamera.current = newPosition;
  //   // }
  //   if (!newPosition) { return; }
    
  //   lookAtVec.set(newPosition.x, newPosition.y, newPosition.z);
  //   cameraVector.lerp(lookAtVec, 0.1);
  //   state.camera.lookAt(cameraVector);
  //   state.camera.updateProjectionMatrix();
  // });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, cameraDistance, cameraDistance * 2]} fov={10}  />
      <OrbitControls
        // ref={activeItemPositionRec2}
        // makeDefault
        // enablePan={true}
        // enableZoom={true}
        // enableDamping={true}
        // dampingFactor={0.2}
        // rotateSpeed={0.5}
        // zoomSpeed={1}
        // panSpeed={0.8}
        // target={activeItemPositionRef.current}
      />
    </>
  );
};
