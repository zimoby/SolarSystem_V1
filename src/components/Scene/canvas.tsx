import { Html, KeyboardControls, KeyboardControlsEntry } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import { Controls } from "../../types";
import { Canvas } from "@react-three/fiber";
import { AppStatsPerformance, ControlComponent, KeyboardInit } from "../ThreeJsMisc";
import { SceneSetup } from ".";
import { SolarSystem } from "./solarSystem";
import { useSolarStore } from "../../store/systemStore";
// import { EffectComposer, Noise, Vignette } from "@react-three/postprocessing";

const cameraDistance = 100;

export const ThreeJsCanvas = () => {
  const DEV_MODE = useSolarStore((state) => state.DEV_MODE);

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
				flat={true}
        gl={{ alpha: false }}
        camera={{ fov: 10, position: [0, cameraDistance, cameraDistance * 2] }}
      >
        <color args={["#111111"]} attach="background" />

        {/* <EffectComposer> */}
          {/* <Bloom height={200} mipmapBlur/> */}
          {/* <Noise opacity={0.2}/> */}
          {/* <Noise opacity={0.2} blendFunction={BlendFunction.MULTIPLY}/> */}
          {/* <Vignette eskil={false} offset={0.1} darkness={1.1} /> */}
          {/* <ToneMapping /> */}
        {/* </EffectComposer> */}

        {/* <SolarEffects /> */}
				{/* <Svg src={svg}  /> */}

				{/* <NeuralNetwork2 ref={particlePositionsRef} /> */}

				{/* <LogoIntroAnimation /> */}
        {DEV_MODE && <AppStatsPerformance />}
				<SceneSetup />
				<Suspense fallback={
					<Html center>
						<div>Loading...</div>
					</Html>
				}>
					<SolarSystem />
				</Suspense>
				<ControlComponent />
        <KeyboardInit />
      </Canvas>
    </KeyboardControls>
  );
};
