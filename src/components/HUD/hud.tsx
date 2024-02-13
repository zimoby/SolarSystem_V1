import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { useSolarSystemStore, useSystemColorsStore, useSystemObjectsStore, useSystemStore } from "../../store/systemStore";
import * as THREE from "three";
import { Html, Line, Segment, Segments, Sphere } from "@react-three/drei";
import { invalidate, useFrame, extend } from "@react-three/fiber";
import { updateActiveName } from "../../hooks/storeProcessing";

// extend({ Line });

export const PlanetHUDComponent = ({ params, planetName, planetSize, extendData = true, typeOfObject = "" }) => {
  const { lineUnderOrbit, lineBelowOrbit, directLine } = useSystemColorsStore.getState().hudColors;
  const planetHuiRef = useRef();
  const planetHuiRefCenter = useRef();
  // const planetPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  // const lineRef2 = useRef(new THREE.Vector3(0, 0, 0));
  const segmentRef = useRef();
  const segmentRef2 = useRef();

  // console.log("line", segmentRef.current);

  useFrame(() => {
    const newPosition = useSolarSystemStore.getState().properties[planetName]?.position;
    if (newPosition) {
      planetHuiRef.current.position.set(newPosition.x, newPosition.y - planetSize, newPosition.z);
      planetHuiRefCenter.current.position.set(newPosition.x, newPosition.y, newPosition.z);

      segmentRef.current.start.set(0,0,0);
      segmentRef.current.end.copy(newPosition);

      segmentRef2.current.start.set(newPosition.x, 0, newPosition.z);
      segmentRef2.current.end.copy(newPosition);

      segmentRef2.current.color.set( newPosition.y > 0 ? lineUnderOrbit.color : lineBelowOrbit.color );
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
      <Segments limit={50} lineWidth={0.3}>
        <Segment ref={segmentRef} start={[0,0,0]} end={[0,0,0]} color="white" />
        <Segment ref={segmentRef2} start={[0,0,0]} end={[0,0,0]} color="white" />
      </Segments>
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



  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const timeToFrames = Math.floor(time * 60);
    if (timeToFrames % 15 === 0) {
      const newPosition = useSolarSystemStore.getState().properties[params.name]?.position;
      if (newPosition && positionTextRef.current) {
        positionTextRef.current.innerText = `${newPosition.x.toFixed(2)} ${newPosition.y.toFixed(2)} ${newPosition.z.toFixed(2)}`;
      }
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