import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";

import { AppStatsPerformance, ControlComponent, KeyboardInit } from "./components/ThreeJsMisc";
import { SolarSystem } from "./components/SolarSystem";
import { SceneSetup } from "./components/Scene";
import { useSyncControlsWithStore } from "./hooks/controls";
import { KeyboardControls, KeyboardControlsEntry } from "@react-three/drei";
import { Controls } from "./types";
import { useSystemStore } from "./store/systemStore";
import { SolarEffects } from "./components/Scene/effects";

function App() {
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
    <>
      <KeyboardControls map={map}>
        <Canvas gl={{ alpha: false }} camera={{ fov: 10, position: [0, cameraDistance, cameraDistance * 2] }}>
          <color args={["#111111"]} attach="background" />
          
          {/* <SolarEffects /> */}
          <AppStatsPerformance />
          <SceneSetup />
          <SolarSystem />
          <ControlComponent />
          <KeyboardInit />
        </Canvas>
      </KeyboardControls>
      <div className="absolute bottom-0 left-1/2">
        <div className="flex flex-col">
            <div className="flex flex-row space-x-3 opacity-50  p-2">
            <p className="text-white text-xs">Three.js Journey</p>
            <p className="text-white text-xs">Challenge 008: Solar System</p>
            <p className="text-white text-xs">Author: Bondartsov Denys</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
