// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { useMemo, useRef } from "react";
import { useSolarStore } from "../../store/systemStore";
import { Html, Point, PointMaterial, Points, shaderMaterial, useTexture } from "@react-three/drei";

import { BufferAttribute, BufferGeometry, Color, Float32BufferAttribute, MathUtils, ShaderMaterial, Vector2, Vector3 } from "three";
import { useFrame, extend, useThree } from "@react-three/fiber";
import { calculateRelativeDistanceXY, calculateTime } from "../../utils/calculations";
import { TrashParamsT } from "../../types";

import textureAtlasSrc from "../../assets/dot_style_atlas.png"

// type Position = {
//   x: number;
//   y: number;
//   z: number;
// };

// const wrapIntoBoundaries = (pos: Position, boundary: number[]): Position => {
//   const newPos: Position = { ...pos };
//   if (pos.x > boundary[0]) newPos.x = -boundary[0];
//   if (pos.x < -boundary[0]) newPos.x = boundary[0];
//   if (pos.y > boundary[1]) newPos.y = -boundary[1];
//   if (pos.y < -boundary[1]) newPos.y = boundary[1];
//   if (pos.z > boundary[2]) newPos.z = -boundary[2];
//   if (pos.z < -boundary[2]) newPos.z = boundary[2];
//   return newPos;
// };

// const PointsCrossSolarSystem = ({ points }: {points: CrossingTrashParamsT[]}) => {
//   const pointRefs = useRef<THREE.Points[]>([]);
//   const pointsVectorRefs = useRef<Vector3[]>([]);
//   const boundary = [10, 10, 3];
//   const allSpeed = 10;

//   useEffect(() => {
//     pointRefs.current = points.map((_, i) => pointRefs.current[i]);
//     pointsVectorRefs.current = points.map((dot) => new Vector3(dot.position.x, dot.position.y, dot.position.z));

//     points.forEach((dot, i) => {
//       if (pointRefs.current[i]) {
//         pointRefs.current[i].position.x = dot.position.x;
//         pointRefs.current[i].position.y = dot.position.y;
//         pointRefs.current[i].position.z = dot.position.z;
//       }
//     });
//   }, [points]);

//   useFrame((_, delta) => {
//     const speedFactor = delta * allSpeed;

//     points.forEach((dot, i) => {
//       const currentRef = pointRefs.current[i];
//       if (currentRef) {
//         const newPos = {
//           x: currentRef.position.x + dot.velocity.x * speedFactor,
//           y: currentRef.position.y + dot.velocity.y * speedFactor,
//           z: currentRef.position.z + dot.velocity.z * speedFactor,
//         };
  
//         const wrappedPos = wrapIntoBoundaries(newPos, boundary);
  
//         currentRef.position.set(wrappedPos.x, wrappedPos.y, wrappedPos.z);
//         pointsVectorRefs.current[i].set(wrappedPos.x, wrappedPos.y, wrappedPos.z);
        
//       }
//     });
//   });

//   const style0 = "" 
//   const style1 = "size-2 border border-red-500 opacity-50";
//   const style2 = "size-2 border rotate-45 border-yellow-500 opacity-50";
//   const style3 = "size-2 border rounded-full border-green-500 opacity-50";
//   const style4 = "size-2 border border-dashed border-blue-500 opacity-50";
//   const style5 = "size-3 border-4 border-double rotate-45 border-pink-500 opacity-50";

//   const dotStyles = [style0, style1, style2, style3, style4, style5];

//   const selectRandomStyle = () => {
//     return Math.floor(Math.random() * dotStyles.length);
//   }

//   return (
//     <>
//       {/* <NeuralNetwork2 ref={pointsVectorRefs} /> */}
//       <Points limit={points.length} rotation-x={Math.PI / 2}>
//         <PointMaterial
//           vertexColors
//           size={1}
//           sizeAttenuation={false}
//           depthWrite={false}
//           toneMapped={false}
//         />
//         {points.map((_dot, i) => (
//           <Point key={i} ref={(el) => (pointRefs.current[i] = el as unknown as THREE.Points)}>
//             <Html center>
//               <div className={dotStyles[selectRandomStyle()]} />
//             </Html>
//           </Point>
//         ))}
//       </Points>
//     </>
//   );
// };

type PointsOrbitRotationProps = {
  points: TrashParamsT[];
  text?: boolean;
  name: string;
};

const PointsOrbitRotation = ({ points, text = false, name }: PointsOrbitRotationProps) => {
  const pointRefs = useRef<THREE.Points[]>([]);
  pointRefs.current = points.map((_, i) => pointRefs.current[i]);

  const baseSpeed = 0.02;
  const extraMultiply = 3;

  const dotsSpeedMultiplier = useMemo(() => {
    const mult = text ? extraMultiply + MathUtils.randFloatSpread(4) : extraMultiply;
    return points.map((dot) => (1 / (dot.distance - 1)) * mult);
  }, [points, text]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * Math.PI * 2;

    points.forEach((dot, i) => {
      const currentRef = pointRefs.current[i];
      if (currentRef) {
        const newAngle = dot.angle + baseSpeed * t * dotsSpeedMultiplier[i];
        const newX = dot.distance * Math.cos(newAngle);
        const newY = dot.distance * Math.sin(newAngle);
        currentRef.position.x = newX;
        currentRef.position.y = newY;
      }
    });
  });

  return (
    <Points limit={points.length} rotation-x={Math.PI / 2}>
      <PointMaterial
        vertexColors
        size={text ? 3 : 1}
        sizeAttenuation={false}
        depthWrite={true}
        toneMapped={false}
      />
      {points.map((dot, i) => (
        <group key={name + i}>
          <Point ref={(el) => (pointRefs.current[i] = el as unknown as THREE.Points)} key={i}>
            {text && (
              <group>
                <Html center>
                  <div className={`size-4 border`} />
                </Html>
                <Html>
                  <div className="ml-3 flex flex-col -space-y-1">
                    <p className="text-white text-xs -mt-2 select-none">
                      {dot.name.toUpperCase()}
                    </p>
                    <p className="text-white text-4xs select-none">
                      {dot.angle.toFixed(2) + ":" + dot.distance.toFixed(2) + ":" + dot.rotation[2].toFixed(2)}
                    </p>
                  </div>
                </Html>
              </group>
            )}
          </Point>
        </group>
      ))}
    </Points>
  );
};

export const TrashComponent = () => {

  const objectsDistance = useSolarStore((state) => state.objectsDistance);
  const maxDistance = useSolarStore((state) => state.maxDistance);
  const minDistance = useSolarStore((state) => state.minDistance);

  const trashInner1 = useSolarStore((state) => state.celestialBodies.trashCollection.trashInner1);
  // const trashInner2 = useSolarStore((state) => state.celestialBodies.trashCollection.trashInner2);
  const trashMiddle1 = useSolarStore((state) => state.celestialBodies.trashCollection.trashMiddle1);
  const trashMiddle2 = useSolarStore((state) => state.celestialBodies.trashCollection.trashMiddle2);
  const trashOuter1 = useSolarStore((state) => state.celestialBodies.trashCollection.trashOuter1);
  const trashCross = useSolarStore((state) => state.celestialBodies.trashCollection.trashCross);

  const trashPositions = useSolarStore((state) => state.celestialBodies.trash);
  // const planetsData = useSolarStore((state) => state.celestialBodies.planets);

  const relativeScaleInner = useMemo(() => {
    return calculateRelativeDistanceXY( trashPositions.trashInner1.semimajorAxis10_6Km, 0, objectsDistance, maxDistance, minDistance, "trash" );
  }, [maxDistance, minDistance, objectsDistance, trashPositions.trashInner1.semimajorAxis10_6Km]);

  const relativeScaleMiddle = useMemo(() => {
    return calculateRelativeDistanceXY( trashPositions.trashMiddle1.semimajorAxis10_6Km, 0, objectsDistance, maxDistance, minDistance, "trash" );
  }, [maxDistance, minDistance, objectsDistance, trashPositions.trashMiddle1.semimajorAxis10_6Km]);

  const relativeScaleOuter = useMemo(() => {
    return calculateRelativeDistanceXY( trashPositions.trashOuter1.semimajorAxis10_6Km, 0, objectsDistance, maxDistance, minDistance, "trash" );
  }, [maxDistance, minDistance, objectsDistance, trashPositions.trashOuter1.semimajorAxis10_6Km]);

  const generateInnerTrash = true;
  const generateMiddleTrash = true;
  const generateOuterTrash = true;
  const generateCrossTrash = true;

  const innerSpeed = 1;

  // console.log("trashPositions", relativeScaleInner, planetsData.earth.semimajorAxis10_6Km);

  return (
    <group>
      {/* <Particles points={trashInner1} rotSpeed={ innerSpeed } size={0.01} />
      <Particles points={trashOuter1} rotSpeed={ innerSpeed * 10 } size={0.2} double={false} /> */}
      {/* <Stars /> */}
      {generateInnerTrash && (
        <>
        <group scale={ [relativeScaleInner.x, relativeScaleInner.x, relativeScaleInner.x] }>
          {/* <SimplePointsWrapper points={trashInner1} rotSpeed={ innerSpeed } size={ 1 } />
          <SimplePointsWrapper points={trashInner1} rotSpeed={ innerSpeed * 2 } size={ 1 } /> */}
          <Particles points={trashInner1} rotSpeed={ innerSpeed } size={0.02} />
          <Particles points={trashInner1} rotSpeed={ innerSpeed * 2 } size={0.02} />

        </group>

        </>
      )}

      {generateOuterTrash && (
        <group scale={[relativeScaleOuter.x, relativeScaleOuter.x, relativeScaleOuter.x]}>
          {/* <SimplePointsWrapper points={trashOuter1} rotSpeed={ outerSpeed } size={ 1 } /> */}
          <Particles points={trashOuter1} rotSpeed={ innerSpeed * 50 } size={0.5} double={false} />
          {/* <Particles points={trashOuter1} rotSpeed={ innerSpeed * 25 } size={0.5} double={false} /> */}

        </group>
      )}

      {generateMiddleTrash && (
        <group scale={[relativeScaleMiddle.x, relativeScaleMiddle.x, relativeScaleMiddle.x]}>
          {/* <PointsOrbitRotation points={trashMiddle1} name={"dots"} /> */}
          <PointsOrbitRotation points={trashMiddle2} text={true} name={"identDots"} />
          <PointsOrbitRotationShader points={trashMiddle1} size={3} name={"identDots"} />
        </group>
      )}

      {generateCrossTrash && <group scale={[relativeScaleInner.x, relativeScaleInner.x, relativeScaleInner.x]}>
        {/* <PointsCrossSolarSystem points={trashCross} /> */}
        <PointsCrossSolarSystemShader points={trashCross} size={20} />
      </group>}
    </group>
  );
};

const ParticleShaderMaterial = shaderMaterial(
  {
    color: new Color(0xffffff),
    time: 0,
    size: 1.0,
    cameraPosition: new Vector3(),
  },
  `
    uniform float size;
    uniform float time;

    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      float distance = length(cameraPosition - worldPosition.xyz);
      gl_PointSize = size * (300.0 / distance); // Adjust this formula as needed
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform vec3 color;
    void main() {
      float r = distance(gl_PointCoord, vec2(0.5, 0.5));
      float delta = 0.02;
      if (r > 0.5) discard;
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ ParticleShaderMaterial });

const Particles = ({ points, rotSpeed, size }) => {
  const pointsRef1 = useRef<THREE.Points>();
  const materialRef = useRef();

  const timeSpeed = useSolarStore((state) => state.timeSpeed);
  const timeOffset = useSolarStore((state) => state.timeOffset);

  // console.log("timeSpeed", timeSpeed);

  const geom = useMemo(() => {
    const geometry = new BufferGeometry();
    const positions = points.flatMap((p) => p.position);
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    return geometry;
  }, [points]);

  useFrame(({ clock }) => {
    // console.log("camera", camera);
    // const time = clock.getElapsedTime();
    // const t_old = clock.getElapsedTime() * Math.PI * 2 / rotSpeed;

    const t = calculateTime(
      clock.getElapsedTime(),
      365,
      timeSpeed,
      timeOffset
    );

    // console.log("timeSpeed", t_old);

    if (pointsRef1.current) {
      pointsRef1.current.rotation.z = t * 50 / rotSpeed;
      // pointsRef2.current.rotation.z = (t / rotSpeed / 2) % (Math.PI * 2);
    }

    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }

  });

  return (
    <group>
      <points
        geometry={geom}
        rotation-x={Math.PI / 2}
        // @ts-expect-error wrong type
        ref={pointsRef1}
      >
        <particleShaderMaterial
          ref={materialRef}
          time={0}
          attach="material"
          size={size}
          color={'#FFFFFF'}
        />
      </points>
    </group>
  );
};

const OrbitShaderMaterial = shaderMaterial(
  {
    time: 0,
    baseSpeed: 0.02,
    distances: [],
    angles: [],
    color: new Color(0xffffff),
    size: 1.0,
  },
  `
    attribute float distance;
    attribute float angle;
    uniform float time;
    uniform float baseSpeed;
    uniform float size;
    void main() {
      float effectiveSpeed = baseSpeed * (1.0 / (distance - 1.0)) * 10.0;
      float newAngle = angle + time * effectiveSpeed;
      vec3 transformed = position;
      transformed.x = distance * cos(newAngle);
      transformed.y = distance * sin(newAngle);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      gl_PointSize = size;
    }
  `,
  `
  uniform vec3 color;
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5, 0.5));
    float delta = 0.02;
    if (r > 0.5) discard;
    gl_FragColor = vec4(color, 1.0);
  }
  `
);

extend({ OrbitShaderMaterial });

const PointsOrbitRotationShader = ({ points, size }) => {
  // const { clock } = useThree();
  const materialRef = useRef();
  const distances = points.map(dot => dot.distance);
  const angles = points.map(dot => dot.angle);

  const geom = useMemo(() => {
    const geometry = new BufferGeometry();

    const positions = new Float32Array(points.length * 3); // Fill with your positions
    const distanceAttr = new Float32Array(distances);
    const angleAttr = new Float32Array(angles);

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('distance', new BufferAttribute(distanceAttr, 1));
    geometry.setAttribute('angle', new BufferAttribute(angleAttr, 1));

    return geometry;
  }, [angles, distances, points.length]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }
  });

  return (
    <points geometry={geom} rotation-x={Math.PI / 2}>
      <orbitShaderMaterial
        ref={materialRef}
        attach="material"
        time={0}
        baseSpeed={0.02}
        size={size.toFixed(2)}
        distances={distances}
        angles={angles}
      />
    </points>
  );
};

const vertexShader = `
  uniform float time;
  uniform vec3 boundaries;
  uniform float velocityMultiplier;
  uniform float size;
  uniform vec2 atlasSize;
  attribute vec3 velocity;
  attribute vec3 color;
  attribute float textureIndex;

  varying vec3 vColor;
  varying vec2 vUv;

  void main() {
      vec3 pos = position + velocity * velocityMultiplier * time;
      pos = mod(pos + boundaries, boundaries * 2.0) - boundaries;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = size;

      vColor = color;

      float nx = mod(textureIndex, atlasSize.x);
      float ny = floor(textureIndex / atlasSize.x);
      float offsetX = nx / atlasSize.x;
      float offsetY = ny / atlasSize.y;
      vUv = vec2(offsetX, offsetY);
  }
`

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 atlasSize;
  varying vec3 vColor;
  varying vec2 vUv;

  void main() {
      vec2 uv = vUv + gl_PointCoord * (1.0 / atlasSize.x);
      vec4 textureColor = texture2D(uTexture, uv);
      gl_FragColor = vec4(vColor * textureColor.rgb, textureColor.a);
  }
`

const randomColorArray = [
  new Color(0xff0000),
  new Color(0x00ff00),
  new Color(0x0000ff),
  new Color(0xffc0cb),
];
const amountOfImages = 4;
const atlasDimensions = Math.sqrt(amountOfImages);

const velocityMultiplier = 5.0;



const PointsCrossSolarSystemShader = ({ points, size }) => {
  // const shaderMaterialRef = useRef();
  const { clock } = useThree();


  const textureAtlas = useTexture(textureAtlasSrc);


  const shaderMaterial = useMemo(() => new ShaderMaterial({
    uniforms: {
      color: { value: new Color(0xffffff) },
      time: { value: 0 },
      boundaries: { value: new Vector3(10, 10, 3) },
      velocityMultiplier: { value: velocityMultiplier },
      size: { value: size },
      uTexture: { value: textureAtlas },
      atlasSize: { value: new Vector2(atlasDimensions, atlasDimensions) },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
  }), [size, textureAtlas]);


  const [positions, velocities, randomColors, randomTextures] = useMemo(() => {
    const positions = points.map(p => [p.position.x, p.position.y, p.position.z]).flat();
    const velocities = points.map(p => [p.velocity.x, p.velocity.y, p.velocity.z]).flat();
    const randomColors = points.map(() => randomColorArray[Math.floor(Math.random() * randomColorArray.length)]);
    const randomTextures = points.map(() => Math.floor(Math.random() * amountOfImages));

    return [positions, velocities, randomColors, randomTextures];
  }, [points]);
  

  useFrame(() => {
    shaderMaterial.uniforms.time.value = clock.getElapsedTime();
    shaderMaterial.depthTest = false;
    shaderMaterial.depthWrite = false;
  });

  const geom = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new Float32BufferAttribute(velocities, 3));
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(randomColors.flatMap(c => c.toArray())), 3));
    geometry.setAttribute('textureIndex', new BufferAttribute(new Float32Array(randomTextures), 1));
    // console.log("geom", geometry);
    return geometry;
  }, [positions, randomColors, randomTextures, velocities]);

  return (
    <points geometry={geom} material={shaderMaterial} rotation-x={Math.PI / 2} />
  );
};