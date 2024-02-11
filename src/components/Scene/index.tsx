import { Environment, GizmoHelper, GizmoViewport, Grid, PerspectiveCamera, Stars, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

import { useRef } from "react";
import { useSystemStore } from "../../store/systemStore";
import galaxy from "../../assets/2k_stars_milky_way.jpg";
import { DoubleSide } from "three";
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export const SceneSetup = () => {

  const { gridSize, ...gridConfig } = {
    gridSize: [10, 10],
    cellSize: 0.1,
    cellThickness: 0.5,
    cellColor: "#ffffff", //6f6f6f
    sectionSize: 1,
    sectionThickness: 1,
    sectionColor: "yellow",
    fadeDistance: 40,
    fadeStrength: 3,
    followCamera: false,
    infiniteGrid: true,
  };
  
  const createOuterSpaceTexture = useTexture(galaxy);

  return (
    <>
      <color args={["#111111"]} attach="background" />

      {/* <EffectComposer> */}
        {/* <Bloom height={200} mipmapBlur/> */}
        {/* <Noise opacity={0.2} blendFunction={BlendFunction.MULTIPLY}/> */}
        {/* <Vignette  offset={0.3} darkness={0.5} /> */}
        {/* <ToneMapping /> */}
      {/* </EffectComposer> */}

      {/* <Environment background files={[skyStars]} /> */}
      {/* <Environment preset="sunset"  /> */}

      {/* <EffectComposer>
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer> */}
      {/* <Environment files="../../assets/2k_stars_milky_way.jpg" /> */}
      {/* <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[10, 32, 32]} />
        <meshStandardMaterial attach="material" map={createOuterSpaceTexture} side={DoubleSide} />
      </mesh> */}
      <hemisphereLight groundColor={"#000000"} intensity={Math.PI / 2} />
      <spotLight position={[2, 2, 2]} angle={0.2} penumbra={1} intensity={Math.PI * 2} />
      <ambientLight intensity={0.4} />
      <Stars />

      <Grid position={[0, 0, 0]} args={gridSize} {...gridConfig} />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={["#9d4b4b", "#2f7f4f", "#3b5b9d"]} labelColor="white" />
      </GizmoHelper>

    </>
  );
};
