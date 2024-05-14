import { useMemo, useRef } from "react";
import { useSolarStore, useSolarPositionsStore } from "../../store/systemStore";
import {
  calculateObjectsRotation, degreesToRadians,
} from "../../utils/calculations";
import * as THREE from "three";
import { PlanetHUDComponent } from "../HUD/hud";
import { Line, Sphere, shaderMaterial, useTexture } from "@react-three/drei";
import { ObjectEllipse } from "../HUD/ellipsis";
import { extend, useFrame } from "@react-three/fiber";
import { updateActiveName } from "../../hooks/storeProcessing";

import saturnRing from "../../assets/saturnringcolor.jpg";
import saturnRingAlpha from "../../assets/saturnringpattern.gif";

import uranusRing from "../../assets/uranusringcolour.jpg";
import uranusRingAlpha from "../../assets/uranusringtrans.gif";

import earthClouds from "../../assets/earthcloudmap.jpg";
import earthCloudsAlpha from "../../assets/earthcloudmaptrans.jpg";
import { PlanetComponentProps } from "../../types";

import moonTexture from "../../assets/2k_moon.jpg";

interface AtmosphereMaterialProps {
  uPlanetRadius: number;
  uAtmosphereRadius: number;
  uColor: THREE.Color;
  transparent: boolean;
  depthWrite?: boolean;
  blending?: THREE.Blending;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      atmosphereMaterial: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & AtmosphereMaterialProps;
    }
  }
}


const AtmosphereMaterial = shaderMaterial(
  {
    uPlanetRadius: 0,
    uAtmosphereRadius: 0,
    uColor: new THREE.Color(0x93C5FD),
  },
  // Vertex Shader
  `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float uPlanetRadius;
    uniform float uAtmosphereRadius;
    uniform vec3 uColor;
    varying vec3 vNormal;
    void main() {

      float intensity = pow(1.04 - dot(vNormal, vec3(0, 0, 1)), 5.0);
      float alphaFactor = smoothstep((uAtmosphereRadius - uPlanetRadius), 0.1, intensity * 0.1);
      if(alphaFactor < 0.05) { 
        discard;
      } else {
        gl_FragColor = vec4(uColor, alphaFactor); 
      }

    }
  `
);


extend({ AtmosphereMaterial });

const PlanetComponent: React.FC<PlanetComponentProps> = ({
  planetName,
  params,
  planetTexture = null,
  type = "planets",
  rotationCorrection = 0
}) => {
  const planetsInitialized = useSolarStore((state) => state.planetsInitialized);
  const timeSpeed = useSolarStore((state) => state.timeSpeed);
  const objectDefaultColors = useSolarStore((state) => state.objectDefaultColors);
  // const atmosphereColor = useSolarStore((state) => state.atmosphereDefaultColors);
  const orbitPathDetalization = useSolarStore((state) => state.orbitPathDetalization);

  // @ts-expect-error tired of typescript
  const siderealRotationPeriodHrs = useSolarStore((state) => state.celestialBodies[type][planetName].siderealRotationPeriodHrs);
  // @ts-expect-error tired of typescript
  const obliquityToOrbitDeg = useSolarStore((state) => state.celestialBodies[type][planetName].obliquityToOrbitDeg);
  // @ts-expect-error tired of typescript
  const planetaryRingSystem = useSolarStore((state) => state.celestialBodies[type][planetName].planetaryRingSystem);
  const planetSize = useSolarStore((state) => state.additionalProperties[planetName].scale);
    
  const planetRef = useRef<THREE.Group>(null);
  const planetRotationRef = useRef<THREE.Group>(null);
  const planetShaderRef = useRef<THREE.Mesh>(null);
  const planetCloudsRef = useRef<THREE.Mesh>(null);

  const [
    createMoonTexture,
  ] = useTexture([
    moonTexture,
  ]);

  const mapedMoonsTextures = {
    moon: createMoonTexture,
  };

  const [earthCloudsTexture, earthAlphaTexture] = useTexture([earthClouds, earthCloudsAlpha]);
  let cloudsTexture = null;
  let cloudsTextureAlpha = null;
  if (planetName === "earth") {
    cloudsTexture = earthCloudsTexture;
    cloudsTextureAlpha = earthAlphaTexture;
  }

  const planetEllipseRotation = useMemo(() => {
    const curve = new THREE.EllipseCurve(
      0, 0,
      planetSize * 1.15, planetSize * 1.15,
      0, 2 * Math.PI,
      false,
      0
    );

    return curve.getPoints(orbitPathDetalization); // Adjust the number of points as needed
  }, [orbitPathDetalization, planetSize]);

  const moons = useMemo(() => {
    const takeMoons = Object.keys(useSolarStore.getState().celestialBodies.moons).filter((moonName) => {
      return useSolarStore.getState().celestialBodies.moons[moonName].type === planetName;
    } ).map((moonName) => {
      const moonData = useSolarStore.getState().celestialBodies.moons[moonName];
      return {
        ...moonData,
        name: moonName,
      }
    } );

    return takeMoons;
   }, [planetName]);

  useFrame((state) => {
    if (!planetsInitialized) { return; }
    const time = state.clock.getElapsedTime();
    if (planetRef.current) {
      planetRef.current.position.copy(useSolarPositionsStore.getState().properties[planetName]?.position as THREE.Vector3);
    }
    if (planetRotationRef.current) {
      planetRotationRef.current.rotation.y = calculateObjectsRotation(time, siderealRotationPeriodHrs ?? 0, timeSpeed ?? 0);
    }

    if (planetCloudsRef.current) {
      planetCloudsRef.current.rotation.y = calculateObjectsRotation(time, siderealRotationPeriodHrs ?? 0, timeSpeed ?? 0);
    }

    if (planetShaderRef.current) {
      // @ts-expect-error tired of typescript
      planetShaderRef.current.uniforms.uTime.value = time;
    }
  });

  const extraRotation = degreesToRadians(obliquityToOrbitDeg);

  return (
    <group>
      <PlanetHUDComponent
        planetName={planetName}
        planetSize={planetSize}
        extendData={type == "planets"}
        typeOfObject={type}
      />
      <group rotation={[0,0,0]}>
        <ObjectEllipse
          params={params}
          name={planetName}
          type={type}
          extraRotation={rotationCorrection}
        />
      </group>
      {/* {type == "planets" && <Trail
        local
        width={planetSize * 100}
        length={5}
        color={"white"}
        attenuation={(t) => t * t}
        // @ts-expect-error tired of typescript
        target={planetRef}
      />} */}
      <group ref={planetRef}  rotation-x={extraRotation}>
        {/* <mesh ref={guiRef}>
          <PlanetInfoCircles
            planetName={planetName}
            planetSize={planetSize}
            params={params}
          />
        </mesh> */}
        <group>
          {moons.map((moon, index) => {
            return (
              <PlanetComponent
                key={index}
                planetName={moon.name}
                params={moon}
                planetTexture={mapedMoonsTextures[moon.name.toLowerCase() as keyof typeof mapedMoonsTextures]}
                type="moons"
                rotationCorrection={extraRotation}
              />
            ); 
          } )}
        </group>
        {planetaryRingSystem &&
          <PlanetRing planetName={planetName} planetSize={planetSize} />
        }
        <group ref={planetRotationRef} >
          <mesh rotation-y={Math.PI / 2}>
            <Line
              points={planetEllipseRotation}
              color={"yellow"}
              lineWidth={1}
            />
          </mesh>
          <Sphere
            key={planetName}
            args={[planetSize, 64, 32]}
            receiveShadow={true}
            castShadow={true}
            onClick={() => {
              updateActiveName(planetName);
            }}
          >
            <meshStandardMaterial
              color={!planetTexture && objectDefaultColors[planetName] || "white"}
              map={planetTexture}
            />

          </Sphere>
          {/* <Sphere
            args={[planetSize * 1.01, 64, 32]} // Adjust the multiplier for the desired atmosphere size
            position={[0, 0, 0]}
          >
            <atmosphereMaterial
              uPlanetRadius={planetSize}
              uAtmosphereRadius={planetSize * 1.01} 
              uColor={new THREE.Color(atmosphereColor[planetName])}
              transparent={true}
              depthWrite={false}
              // blending={THREE.AdditiveBlending}
            />
          </Sphere> */}
           {/* <Sphere
            key={planetName}
            args={[planetSize * 1.1]}

            // {...material}
          >
            <shaderMaterial
              uniforms={uniforms}
              vertexShader={shader.vertexShader}
              fragmentShader={shader.fragmentShader}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              transparent={true}
            />
          </Sphere> */}

          {cloudsTexture && cloudsTextureAlpha && (
            <Sphere
              ref={planetCloudsRef}
              key={planetName + "clouds"}
              args={[planetSize * 1.01, 64, 32]}
              onClick={() => {
                updateActiveName(planetName);
              }}
            >
              <meshStandardMaterial
                map={cloudsTexture}
                alphaMap={cloudsTextureAlpha}
                transparent={true}
              />
            </Sphere>
          )}
        </group>
      </group>
    </group>
  );
};

type PlanetRingProps = {
  planetName: string;
  planetSize: number;
};

const PlanetRing: React.FC<PlanetRingProps> = ({ planetName, planetSize }) => {
  const [
    ringTextureSaturn, alphaTextureSaturn,
    ringTextureUranus, alphaTextureUranus] = useTexture([
      saturnRing, saturnRingAlpha,
      uranusRing, uranusRingAlpha
    ]);
  const ringRef = useRef<THREE.Mesh>(null);

  let extraRotation = 0;
  let useRingTexture = null;
  let useAlphaTexture = null;

  if (planetName === "saturn") {
    useRingTexture = ringTextureSaturn;
    useAlphaTexture = alphaTextureSaturn;
  } else if (planetName === "uranus") {
    useRingTexture = ringTextureUranus;
    useAlphaTexture = alphaTextureUranus;
    extraRotation = Math.PI / 2;
  }

  const ringGeo = useMemo(() => {
    const innerRadius = planetSize * 1.1;
    const outerRadius = planetSize * 3;
    const segments = 96;
    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);

    const uv = geometry.attributes.uv;
    for (let i = 0; i < uv.count; i++) {
      const vertex = new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, i);
      const radius = vertex.x === 0 && vertex.y === 0 ? 0 : vertex.length();
      const normalizedRadius = (radius - innerRadius) / (outerRadius - innerRadius);
      uv.setXY(i, normalizedRadius, uv.getY(i));
    }
    geometry.attributes.uv.needsUpdate = true;

    return geometry;
  }, [planetSize]);

  return (
    <group rotation-x={-Math.PI / 2} rotation-y={extraRotation} >
      <mesh
        ref={ringRef}
        geometry={ringGeo}
        receiveShadow={true}
        castShadow={true}
      >
        <meshStandardMaterial
          color={"white"}
          side={THREE.DoubleSide}
          shadowSide={THREE.DoubleSide}
          map={useRingTexture}
          alphaTest={0.2}
          alphaMap={useAlphaTexture}
        />
      </mesh>
    </group>
  );
}

export default PlanetComponent;

