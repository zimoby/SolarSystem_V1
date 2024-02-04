import "./App.css";
import { Canvas } from "@react-three/fiber";

import { Suspense, useEffect } from "react";

// import solarData from "./data/data.json";
// import starsData from "./data/starsData.json";
import { useControls } from "leva";

import {ToneMapping, Bloom, EffectComposer, Noise, SSAO, Vignette } from "@react-three/postprocessing";
import { Perf } from "r3f-perf";
import { BlendFunction } from "postprocessing";

import { useSystemStore } from "./store/systemStore";
import { AppStatsPerformance, ControlComponent } from "./components/ThreeJsMisc";
import { SolarSystem } from "./components/SolarSystem";
import { SceneSetup } from "./components/Scene";

function App() {

  const {
    timeSpeed,
    timeOffset,
    objectsDistance,
    objectsRelativeScale,
    orbitAngleOffset,
  } = useControls({
    timeSpeed: {
      value: 50,
      min: 1,
      max: 100,
      step: 1,
    },
    timeOffset: {
      value: 0,
      min: -365,
      max: 365,
      step: 1,
    },
    objectsDistance: {
      value: 2,
      min: 1,
      max: 10,
      step: 0.1,
    },
    objectsRelativeScale: {
      value: 1,
      min: 1,
      max: 10,
      step: 1,
    },
    orbitAngleOffset: {
      value: 0,
      min: 0,
      max: 360,
      step: 1,
    },
  });

  useEffect(() => {
    useSystemStore.getState().setTimeOffset(timeOffset);
  }, [timeOffset]);

  useEffect(() => {
    if (timeSpeed === 1) {
      useSystemStore.getState().setTimeSpeed(1);
    } else {
      useSystemStore.getState().setTimeSpeed(timeSpeed * 100000);
    }
  }, [timeSpeed]);

  useEffect(() => {
    useSystemStore.getState().setObjectsDistance(objectsDistance);
  }, [objectsDistance]);

  useEffect(() => {
    useSystemStore.getState().setObjectsRelativeScale(objectsRelativeScale);
  }, [objectsRelativeScale]);

  useEffect(() => {
    useSystemStore.getState().setOrbitAngleOffset(orbitAngleOffset);
  }, [orbitAngleOffset]);

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