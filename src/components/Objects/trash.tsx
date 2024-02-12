import { useEffect, useMemo, useRef } from "react";
import { generateTrash } from "../../utils/generators";
import { useSolarAmounOfItems, useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import { Html, Instance, Instances, Point, PointMaterial, Points, Sphere } from "@react-three/drei";

import { Euler, MathUtils } from "three";
import { useFrame } from "@react-three/fiber";

const PointsComponentDistribution = ({ points, text = false, name }) => {
  const pointRefs = useRef([]);
  pointRefs.current = points.map((_, i) => pointRefs.current[i]);

  const baseSpeed = 0.02;
  const extraMultiply = 3;

  const dotsSpeedMultiplier = useMemo(() => {
    const mult = text ? extraMultiply + MathUtils.randFloatSpread(4) : extraMultiply;
    return points.map((dot) => (1 / (dot.distance - 1)) * mult);
  }, [points, text]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime() * Math.PI * 2;

    points.forEach((dot, i) => {
      // const speedMultiplier = 1 / (dot.distance - 1) * 3;
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
        depthWrite={false}
        toneMapped={false}
      />
      {points.map((dot, i) => (
        <group key={name + i}>
          <Point ref={(el) => (pointRefs.current[i] = el)} key={i}>
            {text && (
              <group>
                <Html center>
                  <div className={`size-4 border`} />
                </Html>
                <Html>
                  <div className="flex flex-raw">
                    <p className="text-white text-xs -mt-2 ml-3 select-none">
                      {dot.name.toUpperCase()}
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
  //   const { disableTrash, objectsDistance, solarScale } = useSystemStore((state) => state);
  //   const trashInnerAmount = useSolarAmounOfItems((state) => state.trashInnerAmount);
  //   const trashMiddleAmount = useSolarAmounOfItems((state) => state.trashMiddleAmount);
  //   const trashOuterAmount = useSolarAmounOfItems((state) => state.trashOuterAmount);

  const trashInner1 = useSolarSystemStore((state) => state.celestialBodies.trash.trashInner1);
  const trashInner2 = useSolarSystemStore((state) => state.celestialBodies.trash.trashInner2);

  const trashMiddle1 = useSolarSystemStore((state) => state.celestialBodies.trash.trashMiddle1);
  const trashMiddle2 = useSolarSystemStore((state) => state.celestialBodies.trash.trashMiddle2);

  const trashOuter1 = useSolarSystemStore((state) => state.celestialBodies.trash.trashOuter1);

  const { solarScale } = useSystemStore.getState();

  // console.log("trashInner1", trashInner1);

  const generateInnerTrash = true;
  const generateMiddleTrash = true;
  const generateOuterTrash = true;

  const innerSpeed = 10;
  const outerSpeed = 100;

  const ref1 = useRef();
  const ref2 = useRef();
  const ref3 = useRef();
  //   const ref4 = useRef()
  useFrame((_, delta) => {
    if (generateInnerTrash) {
      ref1.current.rotation.z = ref1.current.rotation.z + delta / innerSpeed;
      ref2.current.rotation.z = ref2.current.rotation.z + delta / (innerSpeed * 2);
    }
    if (generateOuterTrash) {
      ref3.current.rotation.z = ref3.current.rotation.z + delta / outerSpeed;
    }
    // ref4.current.rotation.z = ref4.current.rotation.z + delta/100
  });

  return (
    <>
      {generateInnerTrash && (
        <>
          <Instances
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
          </Instances>
        </>
      )}

      {generateOuterTrash && (
        <Points scale={solarScale} limit={trashOuter1.length} rotation-x={Math.PI / 2} ref={ref3}>
          <PointMaterial
            vertexColors
            size={1}
            sizeAttenuation={false}
            depthWrite={false}
            toneMapped={false}
          />
          {trashOuter1.map((dot, i) => (
            <Point key={i} index={i} position={dot.position} />
          ))}
        </Points>
      )}

      {generateMiddleTrash && (
        <group scale={solarScale}>
          <PointsComponentDistribution points={trashMiddle1} name={"dots"} />
          <PointsComponentDistribution points={trashMiddle2} text={true} name={"identDots"} />
        </group>
      )}
    </>
  );
};
