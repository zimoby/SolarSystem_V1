import { Ref, forwardRef, useRef } from "react";
import { useSolarStore, useSolarPositionsStore } from "../../store/systemStore";
import * as THREE from "three";
import { Html, Segment, Segments } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { updateActiveName } from "../../hooks/storeProcessing";

// extend({ Line });

type PlanetHUDComponentProps = {
  planetName: string;
  planetSize?: number;
  extendData?: boolean;
  typeOfObject?: string;
};

interface SegmentRef {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: THREE.Color;
  planetSize: number;
}

const planetHui1Pos = new THREE.Vector3(0,0,0);

export const PlanetHUDComponent: React.FC<PlanetHUDComponentProps> = ({ planetName, extendData = true, typeOfObject = "", planetSize = 0.01 }) => {
  const lineUnderOrbit = useSolarStore((state) => state.hudColors.lineUnderOrbit);
  const lineBelowOrbit = useSolarStore((state) => state.hudColors.lineBelowOrbit);

  const planetHuiRef = useRef<THREE.Group>(null);
  const planetHuiRefCenter = useRef<THREE.Group>(null);
  const segmentRef = useRef<SegmentRef>(null);
  const segmentRef2 = useRef<SegmentRef>(null);

  useFrame(() => {
    const newPosition = useSolarPositionsStore.getState().properties[planetName]?.position as THREE.Vector3 | undefined;
    if (newPosition) {

      if (planetHuiRef.current) {
        planetHuiRef.current.position.copy(planetHui1Pos.set(newPosition.x, newPosition.y - planetSize, newPosition.z));
      }

      if (planetHuiRefCenter.current) {
        planetHuiRefCenter.current.position.set(newPosition.x, newPosition.y, newPosition.z);
      }

      if (segmentRef.current) {
        segmentRef.current.start.set(0,0,0);
        segmentRef.current.end.copy(newPosition);
      }

      if (segmentRef2.current) {
        segmentRef2.current.start.set(newPosition.x, 0, newPosition.z);
        segmentRef2.current.end.copy(newPosition);
        segmentRef2.current.color.set( newPosition.y > 0 ? lineUnderOrbit.color : lineBelowOrbit.color );
      }
    }
  });

  let selectionType = ""
  if (typeOfObject === "object") {
    selectionType = "border border-dashed ";
  }

  return (
    <group>
      <InfoAboutObject
        // @ts-expect-error tired of typescript
        ref={planetHuiRef}
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

type InfoAboutObjectProps = {
  params: {
    name: string;
    extendData?: boolean;
  };
  typeOfObject?: string;
};

export const InfoAboutObject = forwardRef<HTMLDivElement, InfoAboutObjectProps>(({ params, typeOfObject = "" }, ref) => {

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

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const timeToFrames = Math.floor(time * 60);
    if (timeToFrames % 15 === 0) {
      const newPosition = useSolarPositionsStore.getState().properties[params.name]?.position as THREE.Vector3 | undefined;
      if (newPosition && positionTextRef.current) {
        positionTextRef.current.innerText = `${newPosition.x.toFixed(2)} ${newPosition.y.toFixed(2)} ${newPosition.z.toFixed(2)}`;
      }
    }
  });
  
  return (
    <group ref={ref as Ref<THREE.Group<THREE.Object3DEventMap>>} >
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