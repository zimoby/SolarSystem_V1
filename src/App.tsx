import "./App.css";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";

import { BlendFunction } from "postprocessing";

import { AppStatsPerformance, ControlComponent, KeyboardInit } from "./components/ThreeJsMisc";
import { SolarSystem } from "./components/SolarSystem";
import { SceneSetup } from "./components/Scene";
import { useSyncControlsWithStore } from "./hooks/controls";
import { KeyboardControls } from "@react-three/drei";
import { Controls } from "./types";

type KeyboardControlsEntry<T extends string = string> = {
  name: T
  keys: string[]
  up?: boolean
}

function App() {
  useSyncControlsWithStore();

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
        <Canvas orthographic gl={{ antialias: true }} dpr={[1, 2]}>
          <AppStatsPerformance />
          <SceneSetup />
          <Suspense fallback={null}>
            <SolarSystem />
          </Suspense>
          <ControlComponent />
          <KeyboardInit />
        </Canvas>
    </KeyboardControls>
  );
}

export default App;
