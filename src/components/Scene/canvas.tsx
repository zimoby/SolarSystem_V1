import { Html, KeyboardControls, KeyboardControlsEntry } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import { Controls } from "../../types";
import { Canvas } from "@react-three/fiber";
import { AppStatsPerformance, ControlComponent, KeyboardInit } from "../ThreeJsMisc";
import { SceneSetup } from ".";
import { SolarSystem } from "./solarSystem";
// import { CenterShader } from "../HUD/shaders";
// import { useSystemStore } from "../../store/systemStore";

const cameraDistance = 100;

export const ThreeJsCanvas = () => {
	// const { sunInitialized, planetsInitialized, randomObjectsInitialized, trashInitialized} = useSystemStore.getState();

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
				// legacy={true}
				flat={true}
        gl={{ alpha: false }}
        camera={{ fov: 10, position: [0, cameraDistance, cameraDistance * 2] }}
      >
        <color args={["#111111"]} attach="background" />

        {/* <SolarEffects /> */}
				{/* <Svg src={svg}  /> */}

				{/* <NeuralNetwork2 ref={particlePositionsRef} /> */}

				{/* <LogoIntroAnimation /> */}
        <AppStatsPerformance />
				<SceneSetup />
				<Suspense fallback={
					<Html center>
						<div>Loading...</div>
					</Html>
				}>
					<SolarSystem />
				</Suspense>
				{/* <CenterShader /> */}
				<ControlComponent />
        <KeyboardInit />
      </Canvas>
    </KeyboardControls>
  );
};
