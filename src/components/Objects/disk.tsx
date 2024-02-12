import { Circle, GradientTexture, GradientType } from "@react-three/drei"
import { DoubleSide } from "three"
import { useSystemStore } from "../../store/systemStore";


export const OrbitDisk = () => {
    const { solarScale } = useSystemStore((state) => state);

    return (
        <Circle scale={solarScale} args={[10, 64]} position={[0, -2, 0]} rotation-x={Math.PI / 2}>
        <meshBasicMaterial side={DoubleSide} transparent={true} opacity={0.4} depthWrite={false}>
          <GradientTexture
            stops={[0, 0.3, 1]}
            colors={['yellow', 'purple', 'black']}
            size={1024}
            width={1024}
            type={GradientType.Radial}
            innerCircleRadius={0}
            outerCircleRadius={'auto'}
          />
        </meshBasicMaterial>
      </Circle>
    )
}