import "./App.css";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";

// import solarData from "./data/data.json";
// import starsData from "./data/starsData.json";
import { useControls } from "leva";

import { BlendFunction } from "postprocessing";

import { useSystemStore } from "./store/systemStore";
import { AppStatsPerformance, ControlComponent } from "./components/ThreeJsMisc";
import { SolarSystem } from "./components/SolarSystem";
import { SceneSetup } from "./components/Scene";
import { useSyncControlsWithStore } from "./hooks/controls";

function App() {
  useSyncControlsWithStore();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black">
      <Canvas orthographic gl={{ antialias: true }}>
        <AppStatsPerformance />
        <SceneSetup />
        <Suspense fallback={null}>
          <SolarSystem />
        </Suspense>
        <ControlComponent />
      </Canvas>
    </div>
  );
}

export default App;
