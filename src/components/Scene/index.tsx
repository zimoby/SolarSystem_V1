import { GizmoHelper, GizmoViewport, Grid, PerspectiveCamera, Stars } from "@react-three/drei";
import {ToneMapping, Bloom, EffectComposer, Noise, SSAO, Vignette } from "@react-three/postprocessing";

export const SceneSetup = () => {
    const cameraDistance = 10;
  
    const { gridSize, ...gridConfig } = {
      gridSize: [10, 10],
      cellSize: 0.1,
      cellThickness: 0.5,
      cellColor: "#6f6f6f",
      sectionSize: 1,
      sectionThickness: 1,
      sectionColor: "yellow",
      fadeDistance: 40,
      fadeStrength: 3,
      followCamera: false,
      infiniteGrid: true,
    };
  
    return (
      <>
        <color args={["#111111"]} attach="background" />

        <PerspectiveCamera makeDefault position={[0, cameraDistance, cameraDistance * 2]} fov={10} />
        <hemisphereLight groundColor={"#000000"} intensity={Math.PI / 2} />
        <spotLight position={[2, 2, 2]} angle={0.2} penumbra={1} intensity={Math.PI * 2} />
        <ambientLight intensity={0.4} />
        <Stars />
  
        <Grid position={[0, 0, 0]} args={gridSize} {...gridConfig} />
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport axisColors={["#9d4b4b", "#2f7f4f", "#3b5b9d"]} labelColor="white" />
        </GizmoHelper>



        {/* <EffectComposer> */}
          {/* <Bloom height={200} mipmapBlur/> */}
          {/* <SSAO /> */}
          {/* <Noise opacity={0.2} 
            blendFunction={BlendFunction.MULTIPLY}
          />
          <Vignette  offset={0.3} darkness={0.5} /> */}
          {/* <ToneMapping /> */}
        {/* </EffectComposer> */}
  
        {/* <Environment background files={[skyStars]} /> */}
        {/* <Environment preset="sunset"  /> */}
      </>
    );
  };
  