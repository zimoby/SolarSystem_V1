import { GizmoHelper, GizmoViewport, Grid, Stars } from "@react-three/drei";
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

  const lightRef = useRef<PointLight>(null);

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.position.set(0, 0.5, 0);
      lightRef.current.shadow.bias = 0.0001;
      lightRef.current.intensity = 2.5;
      lightRef.current.distance = 0;
      lightRef.current.decay = 0;
    }
  }, []);

  return (
    <>
      <group position={[0,0.0,0]}>
        <pointLight ref={lightRef} castShadow={true} />
      </group>
      <ambientLight intensity={0.15} />
      <Stars />

      <Grid position={[0, -2, 0]} args={[10, 10]} {...gridConfig} />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={["#9d4b4b", "#2f7f4f", "#3b5b9d"]} labelColor="white" />
      </GizmoHelper>

    </>
  );
};
