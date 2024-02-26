import { useMemo, useRef } from "react";
import { useSolarStore, useSolarPositionsStore } from "../../store/systemStore";
import { calculateRelativeScale } from "../../utils/calculations";
import { PlanetHUDComponent } from "../HUD/hud";
import { Point, PointMaterial, Points } from "@react-three/drei";
import { ObjectEllipse } from "../HUD/ellipsis";
import { useFrame } from "@react-three/fiber";
import { ObjectsAdditionalDataT } from "../../types";
import { TextureImageData } from "three/src/textures/types.js";
import { Group, Object3DEventMap, Vector3 } from "three";

const ObjectsComponent = ({ planetName, params }: { planetName: string, params: ObjectsAdditionalDataT, planetTexture?: TextureImageData | null }) => {
  const randomObjectsInitialized = useSolarStore((state) => state.randomObjectsInitialized);
  const objectsRelativeScale = useSolarStore((state) => state.objectsRelativeScale);
  const objData = useSolarStore((state) => state.activeObjectInfo[planetName]);
  // const objData = useSolarStore((state) => state.additionalProperties[planetName]);

  const planetSize: number = useMemo(() => {
    if (!randomObjectsInitialized) { return 0.01; }
    return calculateRelativeScale(
      params.volumetricMeanRadiusKm ?? 0,
      objectsRelativeScale,
      planetName
    );
  }, [objectsRelativeScale, params.volumetricMeanRadiusKm, planetName, randomObjectsInitialized]);

  const objectRef = useRef<Group<Object3DEventMap>>(null);
  const typeOfObject = "object";

  useFrame(() => {
    if (objectRef.current && randomObjectsInitialized) {
      objectRef.current.position.copy(useSolarPositionsStore.getState().properties[planetName]?.position as Vector3);
    }
  });

  // console.log("ObjectsComponent", {planetName, params, objData});

  return (
    <group rotation-y={params.rotationY}>
      <PlanetHUDComponent planetName={planetName} planetSize={planetSize} extendData={false} typeOfObject={typeOfObject} />
      <ObjectEllipse params={params} name={planetName} color={params.color} opacity={0.3} />
      <group ref={objectRef}>
        <Points position={[0, 0, 0]}>
          <PointMaterial
            vertexColors
            size={3}
            sizeAttenuation={false}
            depthWrite={true}
            toneMapped={false}
          />
          <Point position={[0, 0, 0]} />
        </Points>
      </group>
    </group>
  );
};

export default ObjectsComponent;
