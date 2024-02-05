import "./App.css";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo } from "react";

// import solarData from "./data/data.json";
// import starsData from "./data/starsData.json";
import { useControls } from "leva";

import { BlendFunction } from "postprocessing";

import { useSystemStore } from "./store/systemStore";
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
      {/* <div className="w-full h-full flex flex-col items-center justify-center bg-black"> */}
        <Canvas orthographic gl={{ antialias: true }}>
          <AppStatsPerformance />
          <SceneSetup />
          <Suspense fallback={null}>
            <SolarSystem />
          </Suspense>
          <ControlComponent />
          <KeyboardInit />
        </Canvas>
      {/* </div> */}
    </KeyboardControls>
  );
}

export default App;
