import { useEffect, useMemo, useRef } from "react";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import { Html, Point, PointMaterial, Points } from "@react-three/drei";

import { MathUtils, Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import { calculateRelativeDistanceXY } from "../../utils/calculations";
import { CrossingTrashParamsT, TrashParamsT } from "../../types";

type SimplePointsWrapperProps = {
  points: TrashParamsT[];
  rotSpeed: number;
  size: number;
};

const SimplePointsWrapper = ({ points, rotSpeed, size }: SimplePointsWrapperProps) => {
  const ref1 = useRef<THREE.Points>();

  useFrame((_, delta) => {
    if (ref1.current) {
      ref1.current.rotation.z += delta / rotSpeed;
    }
  });

  return (
    <Points
      limit={points.length}
      rotation-x={Math.PI / 2}
      // @ts-expect-error tired of typescript
      ref={ref1}
    >
      <PointMaterial
        vertexColors
        size={size}
        sizeAttenuation={false}
        depthWrite={true}
        toneMapped={false}
      />
      {points.map((dot, i) => (
        <Point key={i} position={dot.position} />
      ))}
    </Points>
  );
};

type Position = {
  x: number;
  y: number;
  z: number;
};

const wrapIntoBoundaries = (pos: Position, boundary: number[]): Position => {
  const newPos: Position = { ...pos };
  if (pos.x > boundary[0]) newPos.x = -boundary[0];
  if (pos.x < -boundary[0]) newPos.x = boundary[0];
  if (pos.y > boundary[1]) newPos.y = -boundary[1];
  if (pos.y < -boundary[1]) newPos.y = boundary[1];
  if (pos.z > boundary[2]) newPos.z = -boundary[2];
  if (pos.z < -boundary[2]) newPos.z = boundary[2];
  return newPos;
};

const PointsCrossSolarSystem = ({ points }: {points: CrossingTrashParamsT[]}) => {
  const pointRefs = useRef<THREE.Points[]>([]);
  const pointsVectorRefs = useRef<Vector3[]>([]);
  const boundary = [10, 10, 3];
  const allSpeed = 10;

  useEffect(() => {
    pointRefs.current = points.map((_, i) => pointRefs.current[i]);
    pointsVectorRefs.current = points.map((dot) => new Vector3(dot.position.x, dot.position.y, dot.position.z));

    points.forEach((dot, i) => {
      if (pointRefs.current[i]) {
        pointRefs.current[i].position.x = dot.position.x;
        pointRefs.current[i].position.y = dot.position.y;
        pointRefs.current[i].position.z = dot.position.z;
      }

    });
  }, [points]); 

  useFrame((_, delta) => {
    const speedFactor = delta * allSpeed;

    points.forEach((dot, i) => {
      const currentRef = pointRefs.current[i];
      if (currentRef) {
        const newPos = {
          x: currentRef.position.x + dot.velocity.x * speedFactor,
          y: currentRef.position.y + dot.velocity.y * speedFactor,
          z: currentRef.position.z + dot.velocity.z * speedFactor,
        };
  
        const wrappedPos = wrapIntoBoundaries(newPos, boundary);
  
        currentRef.position.set(wrappedPos.x, wrappedPos.y, wrappedPos.z);
        pointsVectorRefs.current[i].set(wrappedPos.x, wrappedPos.y, wrappedPos.z);
        
      }
    });
  });

  const style0 = "" 
  const style1 = "size-2 border border-red-500 opacity-50";
  const style2 = "size-2 border rotate-45 border-yellow-500 opacity-50";
  const style3 = "size-2 border rounded-full border-green-500 opacity-50";
  const style4 = "size-2 border border-dashed border-blue-500 opacity-50";
  const style5 = "size-3 border-4 border-double rotate-45 border-pink-500 opacity-50";

  const dotStyles = [style0, style1, style2, style3, style4, style5];

  const selectRandomStyle = () => {
    return Math.floor(Math.random() * dotStyles.length);
  }

  return (
    <>
      {/* <NeuralNetwork2 ref={pointsVectorRefs} /> */}
      <Points limit={points.length} rotation-x={Math.PI / 2}>
        <PointMaterial
          vertexColors
          size={1}
          sizeAttenuation={false}
          depthWrite={false}
          toneMapped={false}
        />
        {points.map((_dot, i) => (
          <Point key={i} ref={(el) => (pointRefs.current[i] = el as unknown as THREE.Points)}>
            <Html center>
              <div className={dotStyles[selectRandomStyle()]} />
            </Html>
          </Point>
        ))}
      </Points>
    </>
  );
};

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

// function Stars(props) {
//   const ref = useRef()
//   const [sphere] = useState(() => random.inRect(new Float32Array(5000), { sides: 1 }))
//   useFrame((state, delta) => {
//     ref.current.rotation.x -= delta / 10
//     ref.current.rotation.y -= delta / 15
//   })
//   return (
//     <group rotation={[0, 0, 0]}>
//       <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
//         <PointMaterial transparent color="#ffa0e0" size={0.5} sizeAttenuation={true} depthWrite={false} />
//       </Points>
//     </group>
//   )
// }

// function Stars(props) {
//   // const ref = useRef()
//   // const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }))
//   // useFrame((state, delta) => {
//   //   ref.current.rotation.x -= delta / 10
//   //   ref.current.rotation.y -= delta / 15
//   // })

//   const pointsRef = useRef([]);

//   // const points = useMemo(



//   return (
//     <group rotation={[0, 0, 0]}>
//        {/* <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}> */}
//          <PointMaterial transparent color="#ffa0e0" size={1} sizeAttenuation={true} depthWrite={false} />
//        {/* </Points> */}
//      </group>
//   )
// }

export const TrashComponent = () => {

  const { objectsDistance, maxDistance, minDistance } = useSystemStore.getState();

  const trashInner1 = useSolarSystemStore((state) => state.celestialBodies.trashCollection.trashInner1);
  // const trashInner2 = useSolarSystemStore((state) => state.celestialBodies.trashCollection.trashInner2);
  const trashMiddle1 = useSolarSystemStore((state) => state.celestialBodies.trashCollection.trashMiddle1);
  const trashMiddle2 = useSolarSystemStore((state) => state.celestialBodies.trashCollection.trashMiddle2);
  const trashOuter1 = useSolarSystemStore((state) => state.celestialBodies.trashCollection.trashOuter1);
  const trashCross = useSolarSystemStore((state) => state.celestialBodies.trashCollection.trashCross);

  const trashPositions = useSolarSystemStore((state) => state.celestialBodies.trash);
  const planetsData = useSolarSystemStore((state) => state.celestialBodies.planets);

  const relativeScaleInner = useMemo(() => {
    return calculateRelativeDistanceXY( trashPositions.trashInner1.semimajorAxis10_6Km, 0, objectsDistance, maxDistance, minDistance, "trash" );
  }, [maxDistance, minDistance, objectsDistance, trashPositions.trashInner1.semimajorAxis10_6Km]);



  console.log("trashInner1", relativeScaleInner);

  const generateInnerTrash = true;
  const generateMiddleTrash = true;
  const generateOuterTrash = true;
  const generateCrossTrash = true;

  const innerSpeed = 10;
  const outerSpeed = 100;

  // const ref1 = useRef();
  // const ref2 = useRef();
  // const ref3 = useRef();
  //   const ref4 = useRef()
  // useFrame((_, delta) => {

  //   // console.log("delta", useSolarSystemStore.getState().celestialBodies.trash.trashInner1.semimajorAxis10_6Km);
  //   if (generateInnerTrash) {
  //     // ref1.current.rotation.z = ref1.current.rotation.z + delta / innerSpeed;
  //     // ref2.current.rotation.z = ref2.current.rotation.z + delta / (innerSpeed * 2);
  //   }
  //   if (generateOuterTrash) {
  //     // ref3.current.rotation.z = ref3.current.rotation.z + delta / outerSpeed;
  //   }
  //   // ref4.current.rotation.z = ref4.current.rotation.z + delta/100
  // });

  // useFrame((state) => {
  //   const time = state.clock.getElapsedTime();
  //   planetRef.current.position.copy(useSolarSystemStore.getState().properties[planetName]?.position);
  //   planetRotationRef.current.rotation.y = calculateObjectsRotation(time, siderealRotationPeriodHrs, timeSpeed);

  //   guiRef.current.lookAt(camera.position);
  // });


  console.log("trashPositions", relativeScaleInner, planetsData.earth.semimajorAxis10_6Km);

  return (
    <group>
      {/* <Stars /> */}
      {generateInnerTrash && (
        <>
        <group scale={[relativeScaleInner.x, relativeScaleInner.x, relativeScaleInner.x] }>
          <SimplePointsWrapper points={trashInner1} rotSpeed={ innerSpeed } size={ 1 } />
          <SimplePointsWrapper points={trashInner1} rotSpeed={ innerSpeed * 2 } size={ 1 } />
        </group>
          {/* <Instances
            scale={solarScale}
            limit={trashInner1.length + trashInner2.length}
            rotation-x={Math.PI / 2}
          >
            <icosahedronGeometry />
            <meshStandardMaterial />
            <group ref={ref1}>
              {trashInner1.map((props, index) => (
                <Instance key={index} {...props} />
              ))}
            </group>
            <group ref={ref2}>
              {trashInner2.map((props, index) => (
                <Instance key={index} {...props} />
              ))}
            </group>
          </Instances> */}
        </>
      )}

      {generateOuterTrash && (
        <group scale={[1,1,1]}>
          <SimplePointsWrapper points={trashOuter1} rotSpeed={ outerSpeed } size={ 1 } />
        </group>
      )}

      {generateMiddleTrash && (
        <group scale={[1,1,1]}>
          <PointsOrbitRotation points={trashMiddle1} name={"dots"} />
          <PointsOrbitRotation points={trashMiddle2} text={true} name={"identDots"} />
        </group>
      )}

      {generateCrossTrash && <group>
        <PointsCrossSolarSystem points={trashCross} />
      </group>}
    </group>
  );
};
