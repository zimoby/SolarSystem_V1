import { Box, Html, KeyboardControls, KeyboardControlsEntry, Svg } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Controls } from "../../types";
import { Canvas } from "@react-three/fiber";
import { AppStatsPerformance, ControlComponent, KeyboardInit } from "../ThreeJsMisc";
import { SceneSetup } from ".";
import { SolarSystem } from "./solarSystem";
import { LogoIntroAnimation } from "./logoAnim";

import svg from "../../assets/logo.svg";
import { NeuralNetwork } from "./neuralTest";
import { NeuralNetwork2 } from "./neuralTest copy";
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

	// const particlePositionsRef = useRef([]);

	// const dist = 5;

	// useEffect(() => {
	// 		const positions = new Array(50).fill(0).map(() => ({
	// 				x: Math.random() * dist - dist / 2,
	// 				y: Math.random() * dist - dist / 2,
	// 				z: Math.random() * dist - dist / 2,
	// 		}));
	// 		particlePositionsRef.current = positions;
	// }, []);


  return (
    <KeyboardControls map={map}>
      <Canvas
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
				<ControlComponent />
        <KeyboardInit />
      </Canvas>
    </KeyboardControls>
  );
};
