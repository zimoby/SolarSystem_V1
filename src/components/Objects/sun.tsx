
import { Sphere, useTexture } from "@react-three/drei";
import sunTexture from "../../assets/2k_sun.jpg";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import { calculateRelativeScale } from "../../utils/calculations";
import { InfoAboutObject } from "../HUD/hud";
import { starsScaleFactor } from "../../data/solarSystemData";


export const SunComponent = () => {
    const createSunTexture = useTexture(sunTexture);
    const sunData = useSolarSystemStore((state) => state.celestialBodies.stars.sun);
    const relativeScale = useSystemStore.getState().objectsRelativeScale;
    const sunSize = sunData?.volumetricMeanRadiusKm / starsScaleFactor ?? 0.1;
    const calculatedSunSize = calculateRelativeScale(sunSize, relativeScale);
  
    return (
      <group>
        <InfoAboutObject position={[0, 0, 0]} offset={0.1} params={{ name: "sun" }} />
        <pointLight position={[0, 0, 0]} intensity={1} distance={500} />
        <Sphere
          args={[calculatedSunSize]}
          onClick={() => {
            useSystemStore.getState().updateSystemSettings({ activeObjectName: "sun" });
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