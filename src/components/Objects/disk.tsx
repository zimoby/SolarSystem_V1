import { Circle, GradientTexture, GradientType } from "@react-three/drei"
import { AdditiveBlending, DoubleSide, NormalBlending } from "three"
import { useSystemStore } from "../../store/systemStore";


export const OrbitDisk = ({size = 10, opacity = 0.4, positionYoffset = 0}) => {
    // const { solarScale } = useSystemStore((state) => state);

    return (
      <group>
        <Circle args={[size, 64]} position={[0, positionYoffset + 1, 0]} rotation-x={Math.PI / 2}>
          <meshBasicMaterial
            side={DoubleSide}
            transparent={true}
            opacity={0.03}
            depthWrite={false}
            blending={AdditiveBlending}
          >
            <GradientTexture
              stops={[0, 0.5, 1]}
              colors={['yellow', 'purple', 'blue']}

              // stops={[0, 0.5, 1]}
              // colors={['yellow', 'purple', 'black']}
              size={1024}
              width={1024}
              type={GradientType.Radial}
              innerCircleRadius={0}
              outerCircleRadius={'auto'}
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
              // stops={[0, 0.5, 1]}
              // colors={['yellow', 'purple', 'blue']}

              stops={[0, 0.5, 1]}
              colors={['yellow', 'purple', 'black']}
              size={1024}
              width={1024}
              type={GradientType.Radial}
              innerCircleRadius={0}
              outerCircleRadius={'auto'}
            />
          </meshBasicMaterial>
        </Circle>
      </group>
    )
}