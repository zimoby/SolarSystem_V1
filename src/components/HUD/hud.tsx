import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useSolarSystemStore, useSystemColorsStore, useSystemStore } from "../../store/systemStore";
import * as THREE from "three";
import { Html, Line, Segment, Segments, Sphere } from "@react-three/drei";
import { invalidate, useFrame, extend } from "@react-three/fiber";
import { updateActiveName } from "../../hooks/storeProcessing";

extend({ Line });

const lineMaterial = (color, opacity) => {
  return new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity });
};

export const DynamicLine = ({ start, end, axisColor = false }) => {
  const { lineUnderOrbit, lineBelowOrbit, directLine } = useSystemColorsStore.getState().hudColors;
  const lineRef = useRef();
  const positionsRef = useRef(); // Ref to store the positions array

  useEffect(() => {
    // Initialize the geometry and material only once
    const positions = new Float32Array(6); // 2 points x 3 coordinates
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    lineRef.current.geometry = geometry;

    // const material = new THREE.LineBasicMaterial({ color: 'white' });
    // lineRef.current.material = new THREE.LineBasicMaterial({ color: directLine.color, transparent: true, opacity: directLine.opacity});
    // lineRef.current.material = lineMaterial(directLine.color, directLine.opacity);
    lineRef.current.material = lineMaterial(directLine.color, directLine.opacity);

    positionsRef.current = positions; // Store the positions array for later updates
  }, []);

  useFrame(() => {
    // Update positions directly, avoiding new allocations
    const positions = positionsRef.current;
    if (positions) {
      positions.set([start.x, start.y, start.z, end.x, end.y, end.z]);
      lineRef.current.geometry.attributes.position.needsUpdate = true;

      if (axisColor) {
        const materialColor = end.y > start.y ? lineUnderOrbit.color : lineBelowOrbit.color;
        lineRef.current.material.color.set(materialColor);
      }
    }
  });

  return <line ref={lineRef} />;
};

export const PlanetHUDComponent = ({ planetName, planetSize, extendData = true, typeOfObject = "" }) => {
  const { vec3 } = useSystemStore.getState(); 
  const planetHuiRef = useRef();
  const planetPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  // const lineRef1 = useRef();
  const lineRef2 = useRef(new THREE.Vector3(0, 0, 0));
  // const vec3 = new THREE.Vector3();

  const startPosition = new THREE.Vector3(0, 0, 0); // Example start position
  // const startPositionOrbit = lineRef2.current; // Example start position
  // const endPosition = planetPositionRef.current; // The dynamic end position


  useFrame(() => {
    const newPosition = useSolarSystemStore.getState().properties[planetName]?.position;
    if (newPosition) {
      planetPositionRef.current.copy(newPosition);
      // lineRef.current.start.set(0,0,0);
      // lineRef.current.end.set(newPosition.x, newPosition.y, newPosition.z);
      // console.log("lineRef.current", lineRef.current);
      // lineRef2.current.copy(new THREE.Vector3(newPosition.x, 0, newPosition.z));
      lineRef2.current.copy(vec3.set(newPosition.x, 0, newPosition.z));
      // planetHuiRef.current.position.copy(new THREE.Vector3(newPosition.x, newPosition.y - planetSize, newPosition.z));
      planetHuiRef.current.position.copy(vec3.set(newPosition.x, newPosition.y - planetSize, newPosition.z));
    }
  });

  // const materialProps = {
  //   color: "red",
  //   linewidth: 1,
  //   dashed: false,
  //   gapSize: 0,
  //   dashSize: 0,
  // };


  return (
    <>
      <InfoAboutObject
        ref={planetHuiRef}
        offset={planetSize}
        params={{ name: planetName, extendData}}
        typeOfObject={typeOfObject}
      />
      {/* <Segments
        limit={1000}
        lineWidth={1.0}
        // All THREE.LineMaterial props are valid
        {...materialProps}
      >
        <Segment start={[0, 0, 0]} end={lineRef.current.end} color="red" />
      </Segments> */}
      <DynamicLine start={lineRef2.current} end={planetPositionRef.current} axisColor={true} />
      <DynamicLine start={startPosition} end={planetPositionRef.current} />
    </>
  );
};

export const InfoAboutObject = forwardRef( ({ position = [0,0,0], offset = 0, params, typeOfObject = "" }, ref) => {
// export const InfoAboutObject = ({ position, offset, params, typeOfObject = "" }) => {

  let textStyle;
  let bgStyle;
  switch (typeOfObject) {
    case "object":
      // bgStyle = "bg-red-600/70";
      bgStyle = "bg-black/70";
      textStyle = " text-xs";
      break;
    case "star":
      bgStyle = "bg-yellow-600/70";
      textStyle = " text-xs";
      break;
    case "moon":
      bgStyle = "bg-gray-600/70";
      textStyle = " text-xs";
      break;
    default:
      bgStyle = "bg-black/70 ";
      textStyle = "uppercase font-extrabold text-xs";
      break;
  }

  const positionTextRef = useRef<HTMLParagraphElement>(null);
  const objectRef = useRef();

  // const seconds = useRef<HTMLParagraphElement>(null);
  // useFrame((_, delta) => {
  //   if (seconds.current) {
  //     seconds.current.innerText = (Number(seconds.current.innerText) + delta).toFixed(1);
  //   }
  // });

  useFrame(() => {
    const newPosition = useSolarSystemStore.getState().properties[params.name]?.position;
    // objectRef.current.position.copy({ x: newPosition.x, y: newPosition.y, z: newPosition.z});
    if (newPosition && positionTextRef.current) {
      positionTextRef.current.innerText = `${newPosition.x.toFixed(2)} ${newPosition.y.toFixed(2)} ${newPosition.z.toFixed(2)}`;
    }
  });
  
  // useEffect(() => {
  //   const unsubscribe = useSolarSystemStore.subscribe(
  //     (state) => {
  //       const newPosition = state.properties[params.name]?.position;
  //       if (newPosition && positionTextRef.current) {
  //         positionTextRef.current.innerText = newPosition.x.toFixed(2) + " " + newPosition.y.toFixed(2) + " " + newPosition.z.toFixed(2);
  //         // positionTextRef.current?.innerText = `${newPosition.x.toFixed(2)} ${newPosition.y.toFixed(2)} ${newPosition.z.toFixed(2)}`
  //         // console.log("positionTextRef", positionTextRef.current);
  //       }
  //     },
  //     (state) => state.properties[params.name]
  //   );
  //   return unsubscribe;
  // }, [params.name]);

  
  return (
    <>
      <group ref={ref} >
        {/* <Sphere args={[1]}>
          <meshStandardMaterial attach="material" color={"white"} />
        </Sphere> */}
        <Html center>
        {/* <Html ref={ref} position={[position[0], position[1] - offset, position[2]]} center> */}
          <div
            className={`w-fit h-auto px-1 text-left ${bgStyle} text-red-50 rounded-sm select-none cursor-pointer`}
            style={{ transform: "translate(50%, 75%)" }}
            onClick={() => {
              updateActiveName(params.name);
            }}
          >
            <div className={`${textStyle} text-base`}>{params.name}</div>
            {params.extendData && (
              // <div className="font-mono text-3xs whitespace-nowrap">
              //   {position[0].toFixed(2)} {position[1].toFixed(2)} {position[2].toFixed(2)}
              // </div>
              // <p ref={positionTextRef} className="font-mono text-3xs whitespace-nowrap">0,0,0</p>
              <p className="font-mono text-3xs whitespace-nowrap" ref={positionTextRef}>0.0</p>
            )}
          </div>
        </Html>

      </group>
    </>
  );
});