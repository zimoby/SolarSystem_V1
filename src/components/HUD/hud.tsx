import { Ref, forwardRef, useEffect, useRef } from "react";
import { useSolarStore, useSolarPositionsStore } from "../../store/systemStore";
import * as THREE from "three";
import { Html, Segment, Segments } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { updateActiveName } from "../../hooks/storeProcessing";

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

export const PlanetHUDComponent: React.FC<PlanetHUDComponentProps> = ({
  planetName,
  extendData = true,
  typeOfObject = "",
  planetSize = 0.01
}) => {
  const planetHuiRef = useRef<THREE.Group>(null);
  const planetHuiRefCenter = useRef<THREE.Group>(null);
  const segmentRef = useRef<SegmentRef>(null);
  const segmentRef2 = useRef<SegmentRef>(null);

  const newPositionRef = useRef<THREE.Vector3 | undefined>();

  const directLineColor = useSolarStore((state) => {
    switch (typeOfObject) {
      case "object":
        return state.hudColors.directLineObject.color
      default:
        return state.hudColors.directLine.color;
    }
  });

  const selectionType = typeOfObject === "object" ? "border border-dashed " : "";

  useEffect(() => {
    const unsubscribePosition = useSolarPositionsStore.subscribe(
      (state) => {
        const newPosition = state.properties[planetName]?.position as THREE.Vector3;
        if (newPosition) {
          if (newPositionRef.current) {
            newPositionRef.current.set(newPosition.x, newPosition.y, newPosition.z);
          } else {
            newPositionRef.current = new THREE.Vector3(newPosition.x, newPosition.y, newPosition.z);
          }
        }
      }
    );

    return () => {
      unsubscribePosition();
    };
  }, [planetName]);

  useFrame(() => {
    if (newPositionRef.current) {
      if (planetHuiRef.current) {
        planetHuiRef.current.position.copy(planetHui1Pos.set(newPositionRef.current.x, newPositionRef.current.y - planetSize, newPositionRef.current.z));
      }

      if (planetHuiRefCenter.current) {
        planetHuiRefCenter.current.position.copy(newPositionRef.current);
      }

      if (segmentRef.current) {
        segmentRef.current.start.set(0, 0, 0);
        segmentRef.current.end.copy(newPositionRef.current);
        segmentRef.current.color.set(directLineColor)
      }

      if (segmentRef2.current) {
        segmentRef2.current.start.set(newPositionRef.current.x, 0, newPositionRef.current.z);
        segmentRef2.current.end.copy(newPositionRef.current);
        segmentRef2.current.color.set(newPositionRef.current.y > 0 ?
          useSolarStore.getState().hudColors.lineUnderOrbit.color :
          useSolarStore.getState().hudColors.lineBelowOrbit.color);
      }
    }
  });

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

  console.log("InfoAboutObject", params, typeOfObject);
  let textStyle;
  let bgStyle;
  let selectable = true;
  let selectableStyle = "";
  switch (typeOfObject) {
    case "object":
      bgStyle = "ml-3 mb-2";
      textStyle = "uppercase text-2xs";
      selectableStyle = "cursor-pointer hover:bg-orange-400"
      break;
    case "star":
      bgStyle = "bg-black/70";
      textStyle = "uppercase text-xs";
      selectableStyle = "cursor-pointer hover:bg-red-500"
      break;
    case "moons":
      bgStyle = "bg-gray-600/70";
      textStyle = " text-xs";
      selectable = false;
      break;
    default:
      bgStyle = "bg-black/70 ";
      textStyle = "uppercase font-extrabold text-xs";
      selectableStyle = "cursor-pointer hover:bg-orange-400"
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
          className={`w-fit h-auto px-1 text-left ${bgStyle} text-red-50 rounded-sm select-none ${selectableStyle}`}
          style={{ transform: "translate(50%, 75%)" }}
          onClick={() => {
            if (selectable) {
              updateActiveName(params.name);
            }
          }}
        >
          <div className={`${textStyle}`}>
            { params.name }
          </div>
            {params.extendData && (
              <p className="text-3xs whitespace-nowrap" ref={positionTextRef}>0.0</p>
            )}
        </div>
      </Html>
    </group>
  );
});
