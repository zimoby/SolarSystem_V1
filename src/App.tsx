import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";

import { AppStatsPerformance, ControlComponent, KeyboardInit } from "./components/ThreeJsMisc";
import { SolarSystem } from "./components/SolarSystem";
import { SceneSetup } from "./components/Scene";
import { useSyncControlsWithStore } from "./hooks/controls";
import { KeyboardControls, KeyboardControlsEntry } from "@react-three/drei";
import { Controls } from "./types";
import { useSystemStore } from "./store/systemStore";

function App() {
  const { isInitialized, isInitialized2 } = useSystemStore((state) => state);
  useSyncControlsWithStore();

  const cameraDistance = 100;

  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
      { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
      { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
      { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
      { name: Controls.jump, keys: ["Space"] },
    ], []
  );



  return (
    <KeyboardControls map={map}>
      <Canvas gl={{ alpha: false }} camera={{ near: 0.01, far: 500, fov: 10, position: [0, 100, 100 * 2] }}>
        <color args={["#111111"]} attach="background" />
        
        <AppStatsPerformance />
        <SceneSetup />
        <SolarSystem />
        <ControlComponent />
        <KeyboardInit />
      </Canvas>
    </KeyboardControls>
  );
}

export default App;
