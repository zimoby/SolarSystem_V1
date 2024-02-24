import { GizmoHelper, GizmoViewport, Grid, Stars } from "@react-three/drei";
// import { useThree } from "@react-three/fiber";
// import { EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { useEffect, useRef } from "react";
import { PointLight } from "three";

export const SceneSetup = () => {

  const { ...gridConfig } = {
    cellSize: 0.2,
    cellThickness: 0.5,
    cellColor: "#ffffff", //6f6f6f
    sectionSize: 1,
    sectionThickness: 1,
    sectionColor: "yellow",
    fadeDistance: 100,
    fadeStrength: 3,
    followCamera: false,
    infiniteGrid: true,
  };

  // const {scene} = useThree();
  
  const lightRef = useRef<PointLight>(null);

  // var light2;
  //   light2 = new THREE.PointLight(color, intensity, distance, decay);
  //   //move light
  //   light2.name = "SUNLIGHT";
  //   light2.distance = distance;
  //   light2.decay = decay;
  //   // light2.position.set(lightPositionX, lightPositionY, lightPositionZ);
  //   light2.castShadow = castShadow; // default false
  //   light2.visible = true;
  //   light2.shadow.bias = 0.0001;
  //   light2.shadow.mapSize.width = 4096; // default
  //   light2.shadow.mapSize.height = 4096; // default3
  //   light2.shadow.darkness = 0.1;
  //   light2.shadow.camera.near = 1000000;
  //   light2.shadow.camera.far = 3e9; // default
  //   // light2.color.setHSL(0.5, 0.7, 0.8);

  //   //shadow.camera.fov and rotation shows the shadow.
  //   // light2.shadow.camera.fov = -270;
  //   light2.rotation.set(0, Math.PI, 0);

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.position.set(0, 0.5, 0);
      lightRef.current.shadow.bias = 0.0001;
      // lightRef.current.shadow.darkness = 0.1;
      lightRef.current.intensity = 2.5;
      lightRef.current.distance = 0;
      lightRef.current.decay = 0;


    }
  }, []);

  // const {camera} = useThree();

  // console.log("lightRef", lightRef);
  // const lightTest = new PointLight(0xffffff, 1, 0);
  // lightTest.position.set(0, 0, 0);
  
  // const createOuterSpaceTexture = useTexture(galaxy);

  return (
    <>
      

      {/* <EffectComposer camera={camera}> */}
        {/* <Bloom height={200} mipmapBlur/> */}
        {/* <Noise opacity={0.2}/> */}
        {/* <Noise opacity={0.2} blendFunction={BlendFunction.MULTIPLY}/> */}
        {/* <Vignette eskil={false} offset={0.1} darkness={1.1} /> */}
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
        <meshStandardMaterial attach="material" map={createOuterSpaceTexture} />
      </mesh> */}
      {/* <hemisphereLight groundColor={"#000000"} intensity={Math.PI / 2} /> */}
      {/* <spotLight intensity={1000} /> */}
      <group position={[0,0.0,0]}>
        <pointLight ref={lightRef} castShadow={true} />
      </group>
      {/* <directionalLight intensity={10} /> */}
      <ambientLight intensity={0.4} />
      <Stars />

      <Grid position={[0, -2, 0]} args={[10, 10]} {...gridConfig} />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={["#9d4b4b", "#2f7f4f", "#3b5b9d"]} labelColor="white" />
      </GizmoHelper>

    </>
  );
};
