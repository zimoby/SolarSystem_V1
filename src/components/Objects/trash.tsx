// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { useMemo, useRef } from "react";
import { useSolarStore } from "../../store/systemStore";
import { Html, Point, PointMaterial, Points, shaderMaterial, useTexture } from "@react-three/drei";

import { BufferAttribute, BufferGeometry, Color, Float32BufferAttribute, ShaderMaterial, Vector2, Vector3 } from "three";
import { useFrame, extend } from "@react-three/fiber";
import { calculateRelativeDistanceXY, calculateTime } from "../../utils/calculations";
import { TrashParamsT } from "../../types";

import textureAtlasSrc from "../../assets/dot_style_atlas.png"

export const TrashComponent = () => {

  const objectsDistance = useSolarStore((state) => state.objectsDistance);
  const maxDistance = useSolarStore((state) => state.maxDistance);
  const minDistance = useSolarStore((state) => state.minDistance);

  const trashInner1 = useSolarStore((state) => state.celestialBodies.trashCollection.trashInner1);
  const trashMiddle1 = useSolarStore((state) => state.celestialBodies.trashCollection.trashMiddle1);
  const trashMiddle2 = useSolarStore((state) => state.celestialBodies.trashCollection.trashMiddle2);
  const trashOuter1 = useSolarStore((state) => state.celestialBodies.trashCollection.trashOuter1);
  const trashCross = useSolarStore((state) => state.celestialBodies.trashCollection.trashCross);

  const trashPositions = useSolarStore((state) => state.celestialBodies.trash);

  const disableTrash = useSolarStore((state) => state.disableTrash);

  // console.log("trash data", {minDistance, maxDistance, trashPositions});

  const relativeScaleInner = useMemo(() => {
    return calculateRelativeDistanceXY(
      trashPositions.trashInner1.semimajorAxis10_6Km,
      0,
      objectsDistance,
      maxDistance,
      minDistance,
      "trash inner"
    );
  }, [maxDistance, minDistance, objectsDistance, trashPositions.trashInner1.semimajorAxis10_6Km]);

  const relativeScaleMiddle = useMemo(() => {
    return calculateRelativeDistanceXY(
      trashPositions.trashMiddle1.semimajorAxis10_6Km,
      0,
      objectsDistance,
      maxDistance ?? 1,
      minDistance ?? 0.3,
      "trash middle"
    );
  }, [maxDistance, minDistance, objectsDistance, trashPositions.trashMiddle1.semimajorAxis10_6Km]);

  const relativeScaleOuter = useMemo(() => {
    return calculateRelativeDistanceXY(
      trashPositions.trashOuter1.semimajorAxis10_6Km,
      0,
      objectsDistance,
      maxDistance,
      minDistance,
      "trash outer"
    );
  }, [maxDistance, minDistance, objectsDistance, trashPositions.trashOuter1.semimajorAxis10_6Km]);

  // console.log("relativeScaleInner", relativeScaleInner.x, relativeScaleMiddle.x, relativeScaleOuter.x);

  const generateInnerTrash = true;
  const generateMiddleTrash = true;
  const generateOuterTrash = true;
  const generateCrossTrash = true;

  const innerSpeed = 1;

  return (
    <group>
      {generateInnerTrash && !disableTrash && (
        <>
          <group scale={ [relativeScaleInner.x, relativeScaleInner.x, relativeScaleInner.x] }>
            <Particles points={trashInner1} rotSpeed={ innerSpeed } size={0.007 * relativeScaleInner.x} opacity={0.7} />
            <Particles points={trashInner1} rotSpeed={ innerSpeed * 2 } size={0.007 * relativeScaleInner.x} opacity={0.7} />
          </group>
        </>
      )}

      {generateOuterTrash && !disableTrash && (
        <group scale={[relativeScaleOuter.x, relativeScaleOuter.x, relativeScaleOuter.x]}>
          <Particles points={trashOuter1} rotSpeed={ innerSpeed * 50 } size={0.5} double={false} opacity={0.4} />
        </group>
      )}

      {generateMiddleTrash && !disableTrash && (
        <group scale={[relativeScaleMiddle.x, relativeScaleMiddle.x, relativeScaleMiddle.x]}>
          <PointsOrbitRotation points={trashMiddle2} text={true} name={"identDots"} opacity={0.7} />
          <PointsOrbitRotationShader points={trashMiddle1} size={3} name={"identDots"} opacity={0.7} />
        </group>
      )}

      {generateCrossTrash && !disableTrash && <group scale={[5, 5, 5]}>
        <PointsCrossSolarSystemShader points={trashCross} size={20} />
      </group>}
    </group>
  );
};

type PointsOrbitRotationProps = {
  points: TrashParamsT[];
  text?: boolean;
  name: string;
  opacity?: number;
};

const PointsOrbitRotation = ({ points, text = false, name}: PointsOrbitRotationProps) => {
  const timeSpeed = useSolarStore((state) => state.timeSpeed);
  const timeOffset = useSolarStore((state) => state.timeOffset);

  const pointRefs = useRef<THREE.Points[]>([]);
  pointRefs.current = points.map((_, i) => pointRefs.current[i]);

  const baseSpeed = 6;
  const extraMultiply = 3;

  const dotsSpeedMultiplier = useMemo(() => {
    const mult = text ? extraMultiply + Math.random() * 2 : extraMultiply;
    // const mult = text ? extraMultiply + MathUtils.randFloatSpread(4) : extraMultiply;
    return points.map((dot) => (1 / (dot.distance)) * mult);
  }, [points, text]);

  useFrame(( { clock } ) => {
    const t = calculateTime(
      clock.getElapsedTime(),
      365,
      timeSpeed,
      timeOffset
    );

    points.forEach((dot, i) => {
      const currentRef = pointRefs.current[i];
      if (currentRef) {
        const newAngle = dot.angle + baseSpeed * t  * dotsSpeedMultiplier[i];
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

const ParticleShaderMaterial = shaderMaterial(
  {
    color: new Color(0xffffff),
    time: 0,
    size: 1.0,
    cameraPosition: new Vector3(),
    opacity: { value: 1.0 },
    transparent: true,
  },
  `
    uniform float size;
    uniform float time;

    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      float distance = length(cameraPosition - worldPosition.xyz);
      gl_PointSize = size * (300.0 / distance);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform vec3 color;
    uniform float opacity; 
    void main() {
      float r = distance(gl_PointCoord, vec2(0.5, 0.5));
      float delta = 0.02;
      if (r > 0.5) discard;
      gl_FragColor = vec4(color, opacity);
    }
  `
);

extend({ ParticleShaderMaterial });

const Particles = ({ points, rotSpeed, size, opacity = 1.0 }) => {
  const pointsRef1 = useRef<THREE.Points>();
  const materialRef = useRef();

  const timeSpeed = useSolarStore((state) => state.timeSpeed);
  const timeOffset = useSolarStore((state) => state.timeOffset);
  // const objectsDistance = useSolarStore((state) => state.objectsDistance);

  const geom = useMemo(() => {
    const geometry = new BufferGeometry();
    const positions = points.flatMap((p) => p.position);
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3));
    return geometry;
  }, [points]);

  useFrame(({ clock }) => {
    const t = calculateTime(
      clock.getElapsedTime(),
      365,
      timeSpeed,
      timeOffset
    );

    if (pointsRef1.current) {
      pointsRef1.current.rotation.z = t * 50 / rotSpeed;
    }

    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }

  });

  // console.log("size Particles", size);

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
          // size={size * (Math.pow(objectsDistance, objectsDistance * 0.3))}
          color={'#FFFFFF'}
          opacity={opacity}
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
    transparent: true,
    opacity: 1.0,
  },
  `
    attribute float distance;
    attribute float angle;
    uniform float time;
    uniform float baseSpeed;
    uniform float size;
    void main() {
      float effectiveSpeed = baseSpeed * (1.0 / (distance)) * 10.0;
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
  uniform float opacity;
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5, 0.5));
    float delta = 0.02;
    if (r > 0.5) discard;
    gl_FragColor = vec4(color, opacity);
  }
  `
);

extend({ OrbitShaderMaterial });

const PointsOrbitRotationShader = ({ points, size, opacity = 1.0 }) => {
  const timeSpeed = useSolarStore((state) => state.timeSpeed);
  const timeOffset = useSolarStore((state) => state.timeOffset);

  const materialRef = useRef();
  const distances = points.map(dot => dot.distance);
  const angles = points.map(dot => dot.angle);

  const geom = useMemo(() => {
    const geometry = new BufferGeometry();

    const positions = new Float32Array(points.length * 3);
    const distanceAttr = new Float32Array(distances);
    const angleAttr = new Float32Array(angles);

    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('distance', new BufferAttribute(distanceAttr, 1));
    geometry.setAttribute('angle', new BufferAttribute(angleAttr, 1));

    return geometry;
  }, [angles, distances, points.length]);

  useFrame(({ clock }) => {

    const t = calculateTime(
      clock.getElapsedTime(),
      365,
      timeSpeed,
      timeOffset
    );


    if (materialRef.current) {
      materialRef.current.uniforms.time.value = t * 100;
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
        opacity={opacity}
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
  const timeSpeed = useSolarStore((state) => state.timeSpeed);
  const timeOffset = useSolarStore((state) => state.timeOffset);

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
  

  useFrame(({ clock }) => {
    const t = calculateTime(
      clock.getElapsedTime(),
      365,
      timeSpeed,
      timeOffset
    );

    shaderMaterial.uniforms.time.value = t * 400;
    shaderMaterial.depthTest = false;
    shaderMaterial.depthWrite = false;
  });

  const geom = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new Float32BufferAttribute(velocities, 3));
    geometry.setAttribute('color', new BufferAttribute(new Float32Array(randomColors.flatMap(c => c.toArray())), 3));
    geometry.setAttribute('textureIndex', new BufferAttribute(new Float32Array(randomTextures), 1));
    return geometry;
  }, [positions, randomColors, randomTextures, velocities]);

  return (
    <points geometry={geom} material={shaderMaterial} rotation-x={Math.PI / 2} />
  );
};