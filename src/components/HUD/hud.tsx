import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useSolarSystemStore, useSystemColorsStore, useSystemObjectsStore, useSystemStore } from "../../store/systemStore";
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
  const positionsRef = useRef();

  useEffect(() => {
    const positions = new Float32Array(6);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    lineRef.current.geometry = geometry;

    // const material = new THREE.LineBasicMaterial({ color: 'white' });
    // lineRef.current.material = new THREE.LineBasicMaterial({ color: directLine.color, transparent: true, opacity: directLine.opacity});
    // lineRef.current.material = lineMaterial(directLine.color, directLine.opacity);
    lineRef.current.material = lineMaterial(directLine.color, directLine.opacity);

    positionsRef.current = positions;
  }, []);

  useFrame(() => {
    if (positionsRef.current) {
      positionsRef.current.set([start.x, start.y, start.z, end.x, end.y, end.z]);
      lineRef.current.geometry.attributes.position.needsUpdate = true;

      if (axisColor) {
        const materialColor = end.y > start.y ? lineUnderOrbit.color : lineBelowOrbit.color;
        lineRef.current.material.color.set(materialColor);
      }
    }
  });

  return <line ref={lineRef} />;
};

const line2EndPos = new THREE.Vector3(0,0,0);
const planetHui1Pos = new THREE.Vector3(0,0,0);
const planetHui2Pos = new THREE.Vector3(0,0,0);
const startPosition = new THREE.Vector3(0,0,0);

export const PlanetHUDComponent = ({ params, planetName, planetSize, extendData = true, typeOfObject = "" }) => {
  const planetHuiRef = useRef();
  const planetHuiRefCenter = useRef();
  const planetPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const lineRef2 = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const newPosition = useSolarSystemStore.getState().properties[planetName]?.position;
    if (newPosition) {
      planetPositionRef.current.copy(newPosition);
      lineRef2.current.copy(line2EndPos.set(newPosition.x, 0, newPosition.z));
      planetHuiRef.current.position.copy(planetHui1Pos.set(newPosition.x, newPosition.y - planetSize, newPosition.z));
      planetHuiRefCenter.current.position.copy(planetHui2Pos.set(newPosition.x, newPosition.y, newPosition.z));
    }
  });

  let selectionType = ""
  if (typeOfObject === "object") {
    selectionType = "border border-dashed ";
  }

  return (
    <group>
      <InfoAboutObject
        ref={planetHuiRef}
        offset={planetSize}
        params={{ name: planetName, extendData}}
        typeOfObject={typeOfObject}
      />
      <group ref={planetHuiRefCenter}>
        <Html center>
          <div className={`rotate-45`}>
            <div className={`animate-ping size-5 ${selectionType} `} />
          </div>
        </Html>
        <Html center>
          <div className={`rotate-45`}>
            <div className={`size-5 ${selectionType} `} />
          </div>
        </Html>
      </group>
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
    </group>
  );
};

export const InfoAboutObject = forwardRef( ({ position = [0,0,0], offset = 0, params, typeOfObject = "" }, ref) => {

  let textStyle;
  let bgStyle;
  switch (typeOfObject) {
    case "object":
      // bgStyle = "bg-red-600/70";
      bgStyle = "ml-3 mb-2";
      textStyle = "uppercase text-2xs";
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

  useFrame(() => {
    const newPosition = useSolarSystemStore.getState().properties[params.name]?.position;
    if (newPosition && positionTextRef.current) {
      positionTextRef.current.innerText = `${newPosition.x.toFixed(2)} ${newPosition.y.toFixed(2)} ${newPosition.z.toFixed(2)}`;
    }
  });
  
  return (
    <group ref={ref} >
      <Html center>
        <div
          className={`w-fit h-auto px-1 text-left ${bgStyle} text-red-50 rounded-sm select-none cursor-pointer`}
          style={{ transform: "translate(50%, 75%)" }}
          onClick={() => {
            updateActiveName(params.name);
          }}
        >
        <div className={`${textStyle}`}>{params.name}</div>
          {params.extendData && (
            <p className="text-3xs whitespace-nowrap" ref={positionTextRef}>0.0</p>
          )}
        </div>
      </Html>
    </group>
  );
});