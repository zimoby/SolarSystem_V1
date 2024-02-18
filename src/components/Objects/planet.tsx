import { useMemo, useRef } from "react";
import { useSolarStore, useSolarPositionsStore } from "../../store/systemStore";
import {
  calculateObjectsRotation,
} from "../../utils/calculations";
import * as THREE from "three";
import { PlanetHUDComponent } from "../HUD/hud";
import { Line, Sphere, Trail, useTexture } from "@react-three/drei";
import { ObjectEllipse } from "../HUD/ellipsis";
import { useFrame, useThree } from "@react-three/fiber";
import { updateActiveName } from "../../hooks/storeProcessing";

import saturnRing from "../../assets/saturnringcolor.jpg";
import saturnRingAlpha from "../../assets/saturnringpattern.gif";

import uranusRing from "../../assets/uranusringcolour.jpg";
import uranusRingAlpha from "../../assets/uranusringtrans.gif";

import earthClouds from "../../assets/earthcloudmap.jpg";
import earthCloudsAlpha from "../../assets/earthcloudmaptrans.jpg";
import { SolarObjectParamsBasicWithMoonsT } from "../../types";


// https://github.com/dataarts/webgl-globe/blob/8d746a3dbf95e57ec3c6c2c6effe920c95135253/globe/globe.js
// const Shaders = {
//   'earth' : {
//     uniforms: {
//       'texture': { type: 't', value: null }
//     },
//     vertexShader: [
//       'varying vec3 vNormal;',
//       'varying vec2 vUv;',
//       'void main() {',
//         'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
//         'vNormal = normalize( normalMatrix * normal );',
//         'vUv = uv;',
//       '}'
//     ].join('\n'),
//     fragmentShader: [
//       'uniform sampler2D texture;',
//       'varying vec3 vNormal;',
//       'varying vec2 vUv;',
//       'void main() {',
//         'vec3 diffuse = texture2D( texture, vUv ).xyz;',
//         'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
//         'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
//         'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
//       '}'
//     ].join('\n')
//   },
//   'atmosphere' : {
//     uniforms: {},
//     vertexShader: [
//       'varying vec3 vNormal;',
//       'void main() {',
//         'vNormal = normalize( normalMatrix * normal );',
//         'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
//       '}'
//     ].join('\n'),
//     fragmentShader: [
//       'varying vec3 vNormal;',
//       'void main() {',
//         'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
//         'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
//       '}'
//     ].join('\n')
//   }
// };

const filterParamsOnlyNumbers = (params: SolarObjectParamsBasicWithMoonsT): Record<string, number> => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return typeof value === "number";
    })
  ) as Record<string, number>;
}

type PlanetInfoCirclesProps = {
  planetName: string;
  planetSize: number;
  params: SolarObjectParamsBasicWithMoonsT;
};

const PlanetInfoCircles = ({ planetName, planetSize, params }: PlanetInfoCirclesProps) => {
  const filteredParams: Record<string, number> = filterParamsOnlyNumbers(params);

  // console.log("filteredParams", filteredParams);

  const normalizedValuesTo2MathPI = Object.keys(filteredParams).map((key) => {
    let circleValue = 0;
    switch (key) {
      case "orbitEccentricity":
        circleValue = filteredParams[key] * 10;
        break;
      case "orbitInclinationDeg":
        circleValue = (filteredParams[key] * (2 * Math.PI)) / 360;
        break;
      case "semimajorAxis10_6Km":
        circleValue = (filteredParams[key] / 10) * 2 * Math.PI;
        break;
      case "siderealOrbitPeriodDays":
        circleValue = (filteredParams[key] / 10) * 2 * Math.PI;
        break;
      case "siderealRotationPeriodHrs":
        circleValue = (filteredParams[key] / 24) * 2 * Math.PI;
        break;
      default:
        circleValue = 0;
    }

    return { name: key, value: circleValue };
  });

  return (
    <group key={planetName + "hui-info"}>
      {normalizedValuesTo2MathPI.map((circle, index) => {
        const curve = new THREE.EllipseCurve(
          0, 0,
          planetSize + planetSize * (index + 1) * 0.2, planetSize + planetSize * (index + 1) * 0.2,
          // planetSize + (index + 1) / 15, planetSize + (index + 1) / 15,
          0, circle.value,
          false,
          0
        );

        const points = curve.getPoints(64); // Adjust the number of points as needed

        return (
          <group key={planetName + "hui-info" + index}>
            <Line
              key={index}
              points={points}
              color={"white"}
              lineWidth={2}
            />
            {/* <group>
              <Html position-x={planetSize + (index + 1) / 15}>
                <div className=" text-3xs leading-3 whitespace-nowrap select-none">
                  {circle.name}
                </div>
              </Html>
            </group> */}
          </group>
        );
      })}
    </group>
  );



  // return (
  //   <group>

  //   </group>
  // )
};

type PlanetComponentProps = {
  planetName: string;
  params: SolarObjectParamsBasicWithMoonsT;
  planetTexture?: THREE.Texture | null;
  type: string;
};

const PlanetComponent: React.FC<PlanetComponentProps> = ({ planetName, params, planetTexture = null, type = "planets" }) => {
  const planetsInitialized = useSolarStore((state) => state.planetsInitialized);
  const timeSpeed = useSolarStore((state) => state.timeSpeed);
  const objectDefaultColors = useSolarStore((state) => state.objectDefaultColors);
  const siderealRotationPeriodHrs = useSolarStore((state) => state.celestialBodies[type][planetName].siderealRotationPeriodHrs);
  const planetaryRingSystem = useSolarStore((state) => state.celestialBodies[type][planetName].planetaryRingSystem);
  const planetSize = useSolarStore((state) => state.additionalProperties[planetName].scale);
    
  const planetRef = useRef<THREE.Group>(null);
  const planetRotationRef = useRef<THREE.Group>(null);

  const [earthCloudsTexture, earthAlphaTexture] = useTexture([earthClouds, earthCloudsAlpha]);
  let cloudsTexture = null;
  let cloudsTextureAlpha = null;
  if (planetName === "earth") {
    cloudsTexture = earthCloudsTexture;
    cloudsTextureAlpha = earthAlphaTexture;
  }

  // console.log("planetName", planetName, planetaryRingSystem);

  // const ringTexture = useTexture(saturnRing);
  // ringTexture.wrapS = THREE.RepeatWrapping;
  // ringTexture.flipY = true;

  //--------- processings size

  const planetEllipseRotation = useMemo(() => {
    const curve = new THREE.EllipseCurve(
      0, 0,
      planetSize * 1.15, planetSize * 1.15,
      0, 2 * Math.PI,
      false,
      0
    );

    return curve.getPoints(64); // Adjust the number of points as needed
  }, [planetSize]);

  const guiRef = useRef<THREE.Mesh>(null);

  //--------- processings size

  // const testCurveBuffer = useMemo(() => {
  //   const curve = new THREE.EllipseCurve(
  //     0, 0,
  //     planetSize * 1.2, planetSize * 1.2,
  //     0, params.siderealOrbitPeriodDays / 10,
  //     false,
  //     0
  //   );

  //   return curve.getPoints(32); // Adjust the number of points as needed
  // }, [planetSize]);

  const { camera } = useThree();

  // const shader = Shaders['atmosphere'];
  // const uniforms = THREE.UniformsUtils.clone(shader.uniforms);

  // const material = new THREE.ShaderMaterial({

  //       uniforms: uniforms,
  //       vertexShader: shader.vertexShader,
  //       fragmentShader: shader.fragmentShader,
  //       side: THREE.BackSide,
  //       blending: THREE.AdditiveBlending,
  //       transparent: true

  //     });


  // console.log("camera", camera);

  // -------

  const moons = useMemo(() => {
    // if planetName === moonName, take the data 
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

  //  const rotationCompensation = type === "moons" ? moonsRotationSpeed : 1;

  useFrame((state) => {
    if (!planetsInitialized) { return; }
    const time = state.clock.getElapsedTime();
    if (planetRef.current) {
      planetRef.current.position.copy(useSolarPositionsStore.getState().properties[planetName]?.position as THREE.Vector3);
    }
    if (planetRotationRef.current) {
      planetRotationRef.current.rotation.y = calculateObjectsRotation(time, siderealRotationPeriodHrs ?? 0, timeSpeed ?? 0);
    }

    if (guiRef.current) {
      guiRef.current.lookAt(camera.position);
    }
  });

  return (
    <group>
      <PlanetHUDComponent
        planetName={planetName}
        planetSize={planetSize}
        extendData={type == "planets"}
      />
      <ObjectEllipse
        params={params}
        name={planetName}
        type={type}
      />
      {/* <Trail
        local
        width={planetSize * 100}
        length={5}
        color={"white"}
        attenuation={(t) => t * t}
        // @ts-expect-error tired of typescript
        target={planetRef}
      /> */}
      <group ref={planetRef}>
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
                planetTexture={planetTexture}
                type="moons"
              />
            ); 
          } )}
        </group>
        {planetaryRingSystem &&
          <PlanetRing planetName={planetName} planetSize={planetSize} />
        }
        <group ref={planetRotationRef}>
          <mesh rotation-y={Math.PI / 2}>
            <Line
              points={planetEllipseRotation}
              color={"yellow"}
              lineWidth={1}
            />
          </mesh>
          <Sphere
            key={planetName}
            args={[planetSize]}
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
              key={planetName + "clouds"}
              args={[planetSize * 1.01]}
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
  const [ringTextureSaturn, alphaTextureSaturn] = useTexture([saturnRing, saturnRingAlpha]);
  const [ringTextureUranus, alphaTextureUranus] = useTexture([uranusRing, uranusRingAlpha]);
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

