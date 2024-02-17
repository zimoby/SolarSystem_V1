import { useMemo, useRef } from "react";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import { calculateRelativeScale } from "../../utils/calculations";
import { PlanetHUDComponent } from "../HUD/hud";
import { Point, PointMaterial, Points } from "@react-three/drei";
import { ObjectEllipse } from "../HUD/ellipsis";
import { useFrame } from "@react-three/fiber";
import { ObjectsAdditionalDataT } from "../../types";
import { TextureImageData } from "three/src/textures/types.js";
import { Group, Object3DEventMap, Vector3 } from "three";

const ObjectsComponent = ({ planetName, params }: { planetName: string, params: ObjectsAdditionalDataT, planetTexture?: TextureImageData | null }) => {

  const planetSize: number = useMemo(() => {
    // console.log("test", planetName, params.volumetricMeanRadiusKm);
    return calculateRelativeScale(
      params.volumetricMeanRadiusKm ?? 0,
      useSystemStore.getState().objectsRelativeScale,
      planetName
    );
  }, [params.volumetricMeanRadiusKm, planetName]);

  // const { isInitialized, isInitialized2 } = useSystemStore.getState();

  // console.log("planetName", planetName, isInitialized, isInitialized2, params);

  const objectRef = useRef<Group<Object3DEventMap>>(null);
  const typeOfObject = "object";

  useFrame(() => {
    if (objectRef.current) {
      objectRef.current.position.copy(useSolarSystemStore.getState().properties[planetName]?.position as Vector3);
    }
  });

  return (
    <group>
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
