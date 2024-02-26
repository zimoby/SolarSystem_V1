import { Circle, GradientTexture, GradientType } from "@react-three/drei";
import { AdditiveBlending, DoubleSide, NormalBlending } from "three";
import { useSolarStore } from "../../store/systemStore";

export const OrbitDisk = ({ size = 10, opacity = 0.4, positionYoffset = 0 }) => {
  const objectsDistance = useSolarStore((state) => state.objectsDistance);
  // console.log("OrbitDisk", (Math.pow(objectsDistance,1/2)))
  return (
    <group>
      <Circle args={[size, 64]} position={[0, positionYoffset + 1, 0]} rotation-x={Math.PI / 2}>
        <meshBasicMaterial
          side={DoubleSide}
          transparent={true}
          opacity={0.03 / (Math.pow(objectsDistance,1/2))}
          depthWrite={false}
          blending={AdditiveBlending}
        >
          <GradientTexture
            stops={[0, 0.35, 1]}
            colors={["#FFDA00", "purple", "blue"]}
            size={1024}
            width={1024}
            type={GradientType.Radial as never}
            innerCircleRadius={0}
            outerCircleRadius={"auto"}
          />
        </meshBasicMaterial>
      </Circle>
      <Circle args={[size, 64]} position={[0, positionYoffset, 0]} rotation-x={Math.PI / 2}>
        <meshBasicMaterial
          side={DoubleSide}
          transparent={true}
          opacity={opacity}
          depthWrite={false}
          blending={NormalBlending}
        >
          <GradientTexture
            stops={[0, 0.35, 1]}
            colors={["yellow", "purple", "black"]}
            size={1024}
            width={1024}
            type={GradientType.Radial as never}
            innerCircleRadius={0}
            outerCircleRadius={"auto"}
          />
        </meshBasicMaterial>
      </Circle>
    </group>
  );
};
