
import { Sphere, useTexture } from "@react-three/drei";
import sunTexture from "../../assets/2k_sun.jpg";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import { calculateRelativeScale } from "../../utils/calculations";
import { InfoAboutObject } from "../HUD/hud";


export const SunComponent = () => {
    const createSunTexture = useTexture(sunTexture);
    const sunData = useSolarSystemStore((state) => state.celestialBodies.stars.sun);
    const relativeScale = useSystemStore.getState().objectsRelativeScale;
    const sunSize = sunData?.volumetricMeanRadiusKm / 1000 ?? 0.1;
    const calculatedSunSize = calculateRelativeScale(sunSize, relativeScale);
  
    const setActiveObjectName = useSystemStore((state) => state.setActiveObjectName);

    return (
      <group>
        <InfoAboutObject position={[0, 0, 0]} offset={0.1} params={{ name: "sun" }} />
        <pointLight position={[0, 0, 0]} intensity={1} distance={500} />
        <Sphere
          args={[calculatedSunSize]}
          onClick={() => {
            setActiveObjectName("sun");
          }}
        >
          <meshStandardMaterial
            map={createSunTexture}
            emissive="orange"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </Sphere>
      </group>
    );
  };