import { KeyboardControls, KeyboardControlsEntry } from "@react-three/drei";
import { useMemo } from "react";
import { Controls } from "../../types";
import { Canvas } from "@react-three/fiber";
import { AppStatsPerformance, ControlComponent, KeyboardInit } from "../ThreeJsMisc";
import { SceneSetup } from ".";
import { SolarSystem } from "./solarSystem";

const cameraDistance = 100;

export const ThreeJsCanvas = () => {
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
      <Canvas
        gl={{ alpha: false }}
        camera={{ fov: 10, position: [0, cameraDistance, cameraDistance * 2] }}
      >
        <color args={["#111111"]} attach="background" />

        {/* <SolarEffects /> */}
        <AppStatsPerformance />
        <SceneSetup />
        <SolarSystem />
        <ControlComponent />
        <KeyboardInit />
      </Canvas>
    </KeyboardControls>
  );
};
