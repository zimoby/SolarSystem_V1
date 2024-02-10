import { useMemo, useRef } from "react";
import { generateTrash } from "../../utils/generators";
import { useSolarSystemStore, useSystemStore } from "../../store/systemStore";
import { Html, Instance, Instances, Point, PointMaterial, Points, Sphere } from "@react-three/drei";

import { Euler } from "three";
import { useFrame } from "@react-three/fiber";

const PointsComponentDistribution = ({ points, text = false }) => {
  const pointRefs = useRef([]);
  pointRefs.current = points.map((_, i) => pointRefs.current[i]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime() * Math.PI * 2;

    points.forEach((dot, i) => {
      const baseSpeed = 0.02;

      const speedMultiplier = 1 / (dot.distance - 1);
      const newAngle = dot.angle + baseSpeed * t * speedMultiplier;

      const newX = dot.distance * Math.cos(newAngle);
      const newY = dot.distance * Math.sin(newAngle);

      const currentRef = pointRefs.current[i];
      if (currentRef) {
        currentRef.position.x = newX;
        currentRef.position.y = newY;
      }
    });
  });

  return (
    <Points limit={points.length} rotation={new Euler(Math.PI / 2, 0, 0)}>
      <PointMaterial
        vertexColors
        size={text ? 3 : 1}
        sizeAttenuation={false}
        depthWrite={false}
        toneMapped={false}
      />
      {points.map((dot, i) => (
        <>
          <Point ref={(el) => (pointRefs.current[i] = el)} key={i}>
						{text &&
						<group>
							<Html center>
								{/* <div className={`rotate-45`}> */}
									{/* <div className="flex flex-raw"> */}
										<div className={`size-4 border`} />
										{/* <p className="text-white text-xs ml-3">{123}</p> */}
									{/* </div> */}
								{/* </div> */}
							</Html>
							<Html>
								{/* <div className={`rotate-45`}> */}
									<div className="flex flex-raw">
										{/* <div className={`size-4 border`} /> */}
										<p className="text-white text-xs -mt-2 ml-5">{dot.name.toUpperCase()}</p>
									</div>
								{/* </div> */}
							</Html>
							{/* <Sphere args={[0.1]} position={[0, 0, 0]}>
								<meshStandardMaterial attach="material" color={"white"} />
							</Sphere> */}
						</group>
						}
					</Point>
        </>
      ))}
    </Points>
  );
};

export const TrashComponent = () => {
	const { disableTrash } = useSystemStore((state) => state);
  const trashInner = useSolarSystemStore((state) => state.trashAmount);
  const { solarScale } = useSystemStore((state) => state);

	if (disableTrash) { return }

  const trashInner1 = useMemo(() => {
    return generateTrash(trashInner, 1, 0.2, solarScale);
  }, [solarScale, trashInner]);

  const trashInner2 = useMemo(() => {
    return generateTrash(trashInner, 1, 0.2, solarScale);
  }, [solarScale, trashInner]);

  const trashInner3 = useMemo(() => {
    return generateTrash(3000, 3.5, 1, solarScale);
  }, [solarScale]);

  const trashInner4 = useMemo(() => {
    return generateTrash(1000, 2, 1.7, solarScale);
  }, [solarScale]);

  const trashInner5Text = useMemo(() => {
    return generateTrash(20, 2, 1.7, solarScale);
  }, [solarScale]);

  const ref1 = useRef();
  const ref2 = useRef();
  const ref3 = useRef();
  //   const ref4 = useRef()
  useFrame((state, delta) => {
    ref1.current.rotation.z = ref1.current.rotation.z + delta / 10;
    ref2.current.rotation.z = ref2.current.rotation.z + delta / 20;
    ref3.current.rotation.z = ref3.current.rotation.z + delta / 100;
    // ref4.current.rotation.z = ref4.current.rotation.z + delta/100
  });

  return (
    <>
      <Instances ref={ref1} limit={trashInner1.length} rotation={new Euler(Math.PI / 2, 0, 0)}>
        <icosahedronGeometry />
        <meshStandardMaterial />
        {trashInner1.map((props, index) => (
          <Instance key={index} {...props} />
        ))}
      </Instances>
      <Instances ref={ref2} limit={trashInner2.length} rotation={new Euler(Math.PI / 2, 0, 0)}>
        <icosahedronGeometry />
        <meshStandardMaterial />
        {trashInner2.map((props, index) => (
          <Instance key={index} {...props} />
        ))}
      </Instances>

      <Points limit={trashInner3.length} rotation={new Euler(Math.PI / 2, 0, 0)} ref={ref3}>
        <PointMaterial
          vertexColors
          size={2}
          sizeAttenuation={false}
          depthWrite={false}
          toneMapped={false}
        />
        {trashInner3.map((dot, i) => (
          <Point key={i} index={i} position={dot.position} />
        ))}
      </Points>

      <PointsComponentDistribution points={trashInner4} />
      <PointsComponentDistribution points={trashInner5Text} text={true} />
    </>
  );
};
