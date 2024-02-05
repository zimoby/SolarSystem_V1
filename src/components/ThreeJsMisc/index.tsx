import { OrbitControls, Stats } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";

export const AppStatsPerformance = () => {
  return (
    <>
      <Stats />
      <Perf position="bottom-left" />
    </>
  );
};

export const ControlComponent = () => {
  const [statesUpdate, setStatesUpdate] = useState(0);

  const activeObjectName = useSystemStore.getState().activeObjectName;
  const activeItemPositionRef = useRef(new THREE.Vector3(0, 0, 0));

  // console.log("activeObjectName", activeObjectName);


  useEffect(() => {
    const unsubscribe = useSolarSystemStore.subscribe(
      (state) => {
        const newPosition = state.properties[activeObjectName]?.position;
        // if (newPosition) {
          // if (activeObjectName !== "sun") {
          activeItemPositionRef.current = newPosition; // Update position reference
          setStatesUpdate((prev) => (prev + 1) % 100); // Trigger re-render
          // }
        // }
      },
      (state) => state.properties[activeObjectName]
    );
    return unsubscribe;
  }, [activeObjectName]);

  return (
    <>
      <OrbitControls
        // makeDefault
        // enablePan={true}
        // enableZoom={true}
        // enableDamping={true}
        // dampingFactor={0.2}
        // rotateSpeed={0.5}
        // zoomSpeed={1}
        // panSpeed={0.8}
        target={activeItemPositionRef.current}
      />
    </>
  );
};
