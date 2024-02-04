import "./App.css";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  GizmoHelper,
  GizmoViewport,
  Grid,
  Html,
  Line,
  Octahedron,
  OrbitControls,
  PerspectiveCamera,
  Sphere,
  Stars,
  Stats,
  Text,
  Trail,
  useTexture,
} from "@react-three/drei";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import solarData from "./data/data.json";
import starsData from "./data/starsData.json";
import { useControls } from "leva";

import earthTexture from "./assets/2k_earth_daymap.jpg";
import jupiterTexture from "./assets/2k_jupiter.jpg";
import marsTexture from "./assets/2k_mars.jpg";
import mercuryTexture from "./assets/2k_mercury.jpg";
import neptuneTexture from "./assets/2k_neptune.jpg";
import saturnTexture from "./assets/2k_saturn.jpg";
import uranusTexture from "./assets/2k_uranus.jpg";
import venusTexture from "./assets/2k_venus_surface.jpg";
import sunTexture from "./assets/2k_sun.jpg";
import skyStars from "./assets/2k_stars_milky_way.jpg";
import {ToneMapping, Bloom, EffectComposer, Noise, SSAO, Vignette } from "@react-three/postprocessing";
import { Perf } from "r3f-perf";
import { BlendFunction } from "postprocessing";

import { useSolarSystemStore, useSystemStore } from "./store/systemStore";
// import { color } from "three/examples/jsm/nodes/Nodes.js";


const degreesToRadians = (degrees) => (degrees * Math.PI) / 180;

// const distanceOfEarthToSunKm = 149.6 * 10 ** 6;
const distOfEarthToSun10_6Km = 149.6;


const InfoAboutObject = React.forwardRef(({ positionText, offset, params, setActiveObjectName }, ref) => {
  // const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });

  // console.log("params", ref.current);

  // useEffect(() => {
  //   if (ref?.current) {
  //   console.log("params", params, ref.current.position.x, ref.current.position.y, ref.current.position.z);
  //   setPosition({ x: ref.current.position.x, y: ref.current.position.y, z: ref.current.position.z });
  //   }
  // }, [positionText]);

  // const activePos = useRef(ref?.current?.position || new THREE.Vector3(0, 0, 0));
  

  // useFrame((state, delta) => {
  //   textRef.current = `x: ${activePos.x.toFixed(2)} y: ${activePos.y.toFixed(2)} z: ${activePos.z.toFixed(2)}`;
  // });

  // useEffect(() => {
  //   if (ref?.current) {
  //     const t = new THREE.Vector3();
  //     t.setFromMatrixPosition(ref.current.matrixWorld);
  //     setPosition({ x: t.x, y: t.y, z: t.z });
  //   }
  // }, [ref]);

  return (
    <Html position={[0, -offset, 0]} center>
      <div
        className="w-fit h-auto px-1 text-left text-xs text-red-50 bg-black/70 rounded-sm select-none cursor-pointer"
        style={{ transform: "translate(50%, 75%)" }}
        onClick={() => {
          console.log("clicked on planet", params.name);
          setActiveObjectName(params.name);
        }}
      >
        <div className="uppercase text-base font-extrabold">{params.name}</div>
        <div className="font-mono text-xs whitespace-nowrap">
          {/* {textRef.current} */}
          {positionText}
          {/* {position.x.toFixed(2)} {position.y.toFixed(2)} {position.z.toFixed(2)} */}
        </div>
      </div>
    </Html>
  );
});

const planetsNamesOrder = [
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
];

const listOfParamsIgnoreToNormalize = ["name", "orbitInclinationDeg"];

function App() {
  // const [distSizeFactor, setDistSizeFactor] = useState(1 / 2);

  const {
    timeSpeed,
    timeOffset,
    objectsDistance,
    objectsRelativeScale,
    orbitAngleOffset,
  } = useControls({
    timeSpeed: {
      value: 50,
      min: 1,
      max: 100,
      step: 1,
    },
    timeOffset: {
      value: 0,
      min: -365,
      max: 365,
      step: 1,
    },
    objectsDistance: {
      value: 2,
      min: 1,
      max: 10,
      step: 0.1,
    },
    objectsRelativeScale: {
      value: 1,
      min: 1,
      max: 10,
      step: 1,
    },
    orbitAngleOffset: {
      value: 0,
      min: 0,
      max: 360,
      step: 1,
    },
  });



  useEffect(() => {
    useSystemStore.getState().setTimeOffset(timeOffset);
  }, [timeOffset]);

  useEffect(() => {
    if (timeSpeed === 1) {
      useSystemStore.getState().setTimeSpeed(1);
    } else {
      useSystemStore.getState().setTimeSpeed(timeSpeed * 100000);
    }
  }, [timeSpeed]);

  useEffect(() => {
    useSystemStore.getState().setObjectsDistance(objectsDistance);
  }, [objectsDistance]);

  useEffect(() => {
    useSystemStore.getState().setObjectsRelativeScale(objectsRelativeScale);
  }, [objectsRelativeScale]);

  useEffect(() => {
    useSystemStore.getState().setOrbitAngleOffset(orbitAngleOffset);
  }, [orbitAngleOffset]);
  
  const distSizeFactor = 1 / 2;
  const movementTimeOffset = 0;
  // const orbitAngleOffset = 0;
  const [commonOrbitSpeed, setCommonOrbitSpeed] = useState(60 * 60 * 24 * 2);
  const [commonAxisRotationSpeed, setCommonAxisRotationSpeed] = useState(60 * 2);
  const [sizePlanetsFactor, setsizePlanetsFactor] = useState(0.1 * distSizeFactor);
  const [commonDistFactor, setCommonDistFactor] = useState(1);
  const [changeSize, setChangeSize] = useState(true);
  // const [realtimeUpdate , setRealtimeUpdate] = useState(false);
  // const [planetPositions, setPlanetPositions] = useState({
  //   sun: new THREE.Vector3(0, 0, 0)
  // });

  const planetsPositionCollection = useRef({
    sun: new THREE.Vector3(0, 0, 0),
    ...planetsNamesOrder.reduce((acc, planetName) => {
      acc[planetName] = new THREE.Vector3(0, 0, 0);
      return acc;
    }, {})
  });

  // useEffect(() => {
  //   console.log("planetsPositionCollection", planetsPositionCollection.current);
  // }, [planetsPositionCollection]);

  const [activeObjectName, setActiveObjectName] = useState("sun");  


  const solarSystemDataLink =
    "https://github.com/sempostma/planetary-factsheet/blob/2a108f418ebefbc3859d5a27e09f71bf5367eafd/data.json";
  // const solarDataJsonFile =

  // console.log(solarData)


  const planetsData = useMemo(() => {
    //sort reorder according to planetsNamesOrder
    // console.log("planets data", planetsData);

    const normalizedPlanetsDataToEarth = Object.keys(solarData).reduce((acc, planetName) => {
      const planetData = solarData[planetName];
      const earthData = solarData["earth"];

      // console.log("planet data", planetName, planetData);

      // parse all data in the planet
      const normalizedData = Object.keys(planetData).reduce((acc, key) => {
        if (listOfParamsIgnoreToNormalize.includes(key)) {
          return {
            ...acc,
            [key]: planetData[key],
          };
        }

        if (Array.isArray(planetData[key])) {

          const takeOnlyParams = ["diameterKm", "name", "distanceToPlanetKm"];

          // console.log("key", key, planetData[key]);

          const updatePlanetData = planetData[key].map((subItem, index) => {
            // console.log("subItem" + key, subItem);

            if (typeof subItem !== "object") {
              return subItem;
            }

            return Object.keys(subItem).reduce((acc2, subKey) => {

              if (takeOnlyParams.includes(subKey)) {

                // console.log("subKey", subKey, subItem[subKey], acc2);

                const moonValue = subItem[subKey];

                if (typeof moonValue !== "number") {
                  return {
                    ...acc2,
                    [subKey]: moonValue
                  };
                }

                const earthValue = earthData[subKey];

                if (!earthValue) {
                  return {...acc2,
                    [subKey]: moonValue}
                }

                const normalizedValue = moonValue / earthValue;

                return {
                  ...acc2,
                  [subKey]: normalizedValue,
                };

                // return {
                //   ...acc2,
                //   [subKey]: subItem[subKey],
                // };
              }
              return acc2;
            }, {});


            // const updSubItem = Object.keys(subItem).reduce((acc2, subKey) => {

            //   if (takeOnlyParams.includes(subKey)) {
            //     return {
            //       ...acc2,
            //       [subKey]: subItem[subKey],
            //     };
            //   }
            //   return acc2;
            // }
            // , {});
            // console.log("updSubItem", updSubItem);
          });

          // console.log("updatePlanetData", updatePlanetData);

          return {
            ...acc,
            [key]: updatePlanetData,
          };




      


          // check same object names, if not, then skip. If number, then normalize
          // const updSubItem = Object.keys(planetData[key]).forEach((subKey) => {
          //   if (typeof planetData[key][subKey] !== "number") {
          //     return acc;
          //   }
          //   const planetValue = planetData[key][subKey];
          //   const earthValue = earthData[key][subKey];
          //   const normalizedValue = planetValue / earthValue;
          //   return {
          //     ...acc,
          //     [key]: {
          //       ...acc[key],
          //       [subKey]: normalizedValue,
          //     },
          //   };

          // });
          // return {
          //   ...acc,
          //   [key]: updSubItem,
          // };
        } else if (typeof planetData[key] !== "number") {
          return acc;
        }
        




        // console.log("key", key, planetData[key]);

        
        // else if (typeof planetData[key] !== "number") {
        //   return acc;
        // }

        const planetValue = planetData[key];
        const earthValue = earthData[key];
        const normalizedValue = planetValue / earthValue;
        return {
          ...acc,
          [key]: normalizedValue,
        };
      }, {});

      // console.log("normalizedData", planetName, normalizedData);

      return {
        ...acc,
        [planetName]: normalizedData,
      };
    }, {});

    // console.log("norm data", normalizedPlanetsDataToEarth)

    const reorderedPlanetsData = planetsNamesOrder.map((planetName) => {
      const planetData = normalizedPlanetsDataToEarth[planetName];
      return {
        ...planetData,
        name: planetName,
      };
    });

    return reorderedPlanetsData;
  }, []);


  const planetsSystem = useMemo(() => {
    // console.log("planetsData", planetsData);
    return planetsData.map((planet, index) => {
      return {
        // commonParams: {
        //   distSizeFactor,
        //   commonOrbitSpeed,
        //   commonAxisRotationSpeed,
        //   sizePlanetsFactor,
        //   commonDistFactor,
        // },
        planetParams: planet,
        dist: commonDistFactor * planet.semimajorAxis10_6Km,
        size: sizePlanetsFactor * (changeSize ? planet.diameterKm : 1),
        orbitSpeed: commonOrbitSpeed / planet.siderealOrbitPeriodDays,
        axisRotationSpeed: commonAxisRotationSpeed / planet.siderealRotationPeriodHrs,
        showOrbit: true,
        posOffset: movementTimeOffset,
        orbitAngleOffset
      };
    });
  }, [planetsData, commonOrbitSpeed, commonAxisRotationSpeed, sizePlanetsFactor, commonDistFactor, changeSize, movementTimeOffset, orbitAngleOffset]);



  // useEffect(() => {
  //   console.log("all planets data", planetsSystem);
  // }, [planetsSystem]);



  const Sun = ({setActiveObjectName}) => {
    const createSunTexture = useTexture(sunTexture);

    // const three = useThree();
    // console.log("three", three.camera);

    return (
      <group>
        {/* light */}
        <InfoAboutObject position={[0,0,0]} offset={0.1} params={{name: "sun"}} setActiveObjectName={setActiveObjectName} />
        <pointLight position={[0, 0, 0]} intensity={1} distance={500} />
        <Sphere args={[1]} scale={[0.1, 0.1, 0.1]} onClick={() => {
          // console.log("clicked on sun");
          // setActiveObjectName("sun");
          useSystemStore.getState().setActiveObjectName("sun");
        }}>
          <meshStandardMaterial map={createSunTexture} emissive="orange" emissiveIntensity={2} toneMapped={false} />
        </Sphere>
      </group>
    );
  };


  



  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black">
      <Canvas orthographic gl={{ antialias: true }}>
        <ControlComponent planetsPositionCollection={planetsPositionCollection} activeObjectName={activeObjectName} />
        <AppStatsPerformance />
        <SceneSetup />

        <SolarSystem />

        {/* <PlanetConnections planetPositions={Object.values(planetPositions)} /> */}

        {/* {planetsSystem.map((planet, index) => {
          return <CosmicSphere key={index} planetsPositionCollection={planetsPositionCollection} setActiveObjectName={setActiveObjectName} {...planet} />;
        })} */}

        {/* <Sun setActiveObjectName={setActiveObjectName} /> */}
      </Canvas>
    </div>
  );
}

const SolarSystem = () => {

  useInitiateSolarSystem();
  useCelestialBodyUpdates();


  return (
    <>
      <GeneratePlanets />
      <SunComponent />
    </>
  )
}

const normalizeDataToEarth = (objData) => {
  const earthData = solarData["earth"];
  const normalizedData = Object.keys(objData).reduce((acc, key) => {

    const planetValue = objData[key];
    const earthValue = earthData[key];

    if (typeof planetValue !== "number" || typeof earthValue !== "number" || earthValue === 0 || planetValue === 0) {
      return {
        ...acc,
        [key]: planetValue
      }
    }

    // console.log("planetValue", planetValue, earthValue);
    const normalizedValue = planetValue / earthValue;
    return {
      ...acc,
      [key]: normalizedValue,
    };
  }, {});
  return normalizedData;
}

// function calculateAdjustedLog(distance, sliderValue) {
//   const base = 2 + sliderValue; 
//   return Math.log(distance) / Math.log(base);
// }

const useInitiateSolarSystem = () => {

  const usedProperties = ["volumetricMeanRadiusKm", "semimajorAxis10_6Km", "siderealOrbitPeriodDays", "orbitInclinationDeg"]
  // const earthData = solarData["earth"];

  // const relativeDistanceToSun = useSystemStore.getState().objectsDistance;

  // console.log("relativeDistanceToSun", relativeDistanceToSun);
  const sunData = starsData["sun"];

  const reorderPlanets = useMemo(() => {
    // reorder object
    return planetsNamesOrder.reduce((acc, planetName) => {
      const planetData = solarData[planetName];
      return {
        ...acc,
        [planetName]: planetData
      };
    }, {});
  }, []);

  useEffect(() => {
    //process planets data
    Object.keys(reorderPlanets).forEach((planetName) => {
      const planetData = reorderPlanets[planetName];

      // Prepare planet data excluding moons for adding to the store
      const { moons, ...planetWithoutMoonData } = planetData;

      const filterPlanetData = Object.keys(planetWithoutMoonData).reduce((acc, key) => {
        if (usedProperties.includes(key)) {
          return {
            ...acc,
            [key]: planetWithoutMoonData[key]
          }
        }
        return acc;
      }, {});

      // normalize data
      const normalizedPlanetData = normalizeDataToEarth(filterPlanetData);

      console.log("normalizedPlanetData", planetName, normalizedPlanetData);

      const additionalProcessingParams = Object.keys(normalizedPlanetData).reduce((acc, key) => {
        // console.log("key", key, normalizedData[key]);

        if (key === "volumetricMeanRadiusKm") {
          return {
            ...acc,
            [key]: normalizedPlanetData[key] / 100 // /1000000
          }
        } else if (key === "semimajorAxis10_6Km") {
          return {
            ...acc,
            [key]: normalizedPlanetData[key] // calculateAdjustedLog(normalizedPlanetData[key], 0) // Math.pow(normalizedPlanetData[key], 1 / relativeDistanceToSun)
          }
        } else {
          return {
            ...acc,
            [key]: normalizedPlanetData[key]
          }
        }

      }, {});

      // console.log("additionalProcessingParams", planetName, additionalProcessingParams);


      // Add planet data
      useSolarSystemStore.getState().addCelestialBody("planets", planetName, additionalProcessingParams);

      // Add moons if they exist
      if (planetData.moons && planetData.moons.length > 0) {
        planetData.moons.forEach((moon) => {
          const updatedMoonData = {
            ...moon,
            type: planetName // Assuming 'type' indicates the moon's parent planet
          };
          useSolarSystemStore.getState().addCelestialBody("moons", moon.name, updatedMoonData);
        });
      }
      
      // Initialize default position and rotation for each planet
      useSolarSystemStore.getState().addCelestialBodyProperty(planetName, "position", new THREE.Vector3(0, 0, 0));
      useSolarSystemStore.getState().addCelestialBodyProperty(planetName, "rotation", new THREE.Euler(0, 0, 0));
    });

    // process sun data
    // const sunData = useSolarSystemStore.getState().celestialBodies.stars.sun;
    const normalizedSunData = normalizeDataToEarth(sunData);
    console.log("normalizedSunData", normalizedSunData);
    useSolarSystemStore.getState().addCelestialBody("stars", "sun", normalizedSunData);
  }, []); 

}

const calculateRelativeDistance = (distance, sliderValue) => {
  return Math.pow(distance, 1 / sliderValue);
}

const calculateRelativeScale = (size, sliderValue) => {
  return Math.pow(size, 1 / sliderValue) / sliderValue - (sliderValue - 1) * 0.007;
}

const useCelestialBodyUpdates = () => {
  const frameRate = 30;
  const frameInterval = 1 / frameRate;

  useFrame((state, delta) => {
    const properties = useSolarSystemStore.getState().properties;

    if (state.clock.getElapsedTime() % frameInterval < delta) {
    //   updateCelestialBodyPositions(t, properties);
    // }
      Object.keys(properties).forEach((name) => {
        const celestialBody = useSolarSystemStore.getState().celestialBodies.planets[name] || {};
        
        if (celestialBody.semimajorAxis10_6Km) {

          const t = ((state.clock.getElapsedTime() * Math.PI * 2) / 60 / 60 / 24 / 365 / celestialBody.siderealOrbitPeriodDays * useSystemStore.getState().timeSpeed + (useSystemStore.getState().timeOffset * (Math.PI * 2) / 365)) % (Math.PI * 2);
          const recalcDistance = calculateRelativeDistance(celestialBody.semimajorAxis10_6Km, useSystemStore.getState().objectsDistance);
          // Position update logic
          const newPosition = new THREE.Vector3(
            Math.cos(t) * recalcDistance,
            0,
            Math.sin(t) * recalcDistance
          );
          const quaternion = new THREE.Quaternion();
          quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), degreesToRadians(celestialBody.orbitInclinationDeg + useSystemStore.getState().orbitAngleOffset) );
          newPosition.applyQuaternion(quaternion);

          // Rotation update logic
          const currentRotation = properties[name]?.rotation || new THREE.Euler(0, 0, 0);
          const newRotation = new THREE.Euler(currentRotation.x, currentRotation.y + 0.01, currentRotation.z);

          // Updating the store
          useSolarSystemStore.getState().updateProperty(name, "position", newPosition);
          useSolarSystemStore.getState().updateProperty(name, "rotation", newRotation);
          

          // console.log("planet name", name, newPosition);

        }
      });
    }
  });
};

const SceneSetup = () => {
  const cameraDistance = 3;

  const { gridSize, ...gridConfig } = {
    gridSize: [10, 10],
    cellSize: 0.1,
    cellThickness: 0.5,
    cellColor: "#6f6f6f",
    sectionSize: 1,
    sectionThickness: 1,
    sectionColor: "yellow",
    fadeDistance: 40,
    fadeStrength: 3,
    followCamera: false,
    infiniteGrid: true,
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, cameraDistance , cameraDistance * 2]} fov={10} />
      <hemisphereLight groundColor={"#000000"} intensity={Math.PI / 2} />
      <spotLight position={[2, 2, 2]} angle={0.2} penumbra={1} intensity={Math.PI * 2} />
      <ambientLight intensity={0.4} />
      <Stars />

      <Grid position={[0, 0, 0]} args={gridSize} {...gridConfig} />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={["#9d4b4b", "#2f7f4f", "#3b5b9d"]} labelColor="white" />
      </GizmoHelper>

      {/* <Environment background files={[skyStars]} /> */}
      {/* <Environment preset="sunset"  /> */}
    </>
  );
}

const AppStatsPerformance = () => {
  return (
    <>
        <Stats />
        <Perf position="bottom-left"  />
    </>
  );
}

const ControlComponent = ({planetsPositionCollection , activeObjectName}) => {
  const [statesUpdate, setStatesUpdate] = useState(0);

  const activeItemPosition = useMemo(() => {
    return planetsPositionCollection.current[activeObjectName];
  }, [activeObjectName, statesUpdate]);

  useFrame((state, delta) => {

    const frameRate = 30; // Desired frame rate
    const frameInterval = 1 / frameRate; // Interval between frames

    if (state.clock.getElapsedTime() % frameInterval < delta) {
      setStatesUpdate(prev => (prev + 1) % 1000); // Changing this state will cause a re-render
    }

  })
  
  return (
    <>
      <color args={["#111111"]} attach="background" />
      {/* <EffectComposer> */}
        {/* <Bloom height={200} mipmapBlur/> */}
        {/* <SSAO /> */}
        {/* <Noise opacity={0.2} 
          blendFunction={BlendFunction.MULTIPLY}
        />
        <Vignette  offset={0.3} darkness={0.5} /> */}
        {/* <ToneMapping /> */}
      {/* </EffectComposer> */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableDamping={true}
        dampingFactor={0.2}
        rotateSpeed={0.5}
        zoomSpeed={1}
        panSpeed={0.8}
        target={activeItemPosition}
      />
    </>
  );
}

const PlanetComponent = ({planetName, params, planetTexture}) => {

  // const planetSize = params.volumetricMeanRadiusKm;
  // console.log("planet name", planetName, params.volumetricMeanRadiusKm);
  const planetSize = calculateRelativeScale(params.volumetricMeanRadiusKm, useSystemStore.getState().objectsRelativeScale);
  const planetDistance = calculateRelativeDistance(params.semimajorAxis10_6Km, useSystemStore.getState().objectsDistance);
  const planetInclination = degreesToRadians(params.orbitInclinationDeg + useSystemStore.getState().orbitAngleOffset);

  // console.log("planet name", planetName, planetSize, planetDistance);

  // const planetPositionFromStore = useSolarSystemStore.getState().properties[planetName]?.position;

  // console.log("planet name", planetName, planetSize, planetPositionFromStore);
  
  // const planetRef = useRef();
  const planetPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  // const [updateTrigger, setUpdateTrigger] = useState(0);
  // const planetPosRef2 = useRef(useSolarSystemStore.getState().properties[planetName]?.position);

  // useEffect(() => {
  //   console.log("planet position ref", planetPositionRef.current);
  // }, [planetPositionRef]);
  

  // const Component = () => {
  //   // Fetch initial state
  //   const scratchRef = useRef(useScratchStore.getState().scratches)
  //   // Connect to the store on mount, disconnect on unmount, catch state-changes in a reference
  //   useEffect(() => useScratchStore.subscribe(
  //     state => (scratchRef.current = state.scratches)
  //   ), [])
  //   ...

  // useEffect(() => { useSolarSystemStore.subscribe(
  //   state => (planetPosRef2.current = state.properties[planetName]?.position)
  // )}, []);

  useEffect(() => {
    const unsubscribe = useSolarSystemStore.subscribe(
      (state) => {
        planetPositionRef.current.position.copy(state.properties[planetName]?.position);
      },
      (state) => state.properties[planetName] // This function selects which part of the state to subscribe to
    );
    return unsubscribe; 
  }, []);

  const points = useMemo(
    () => new THREE.EllipseCurve(0, 0, planetDistance, planetDistance, 0, Math.PI * 2, false).getPoints(64 * 3),
    [planetDistance]
  );

  const pointsDependOnInclination = useMemo(() => {
    const ellipseSize = planetDistance * Math.cos(planetInclination);
    return new THREE.EllipseCurve(0, 0, planetDistance, ellipseSize, 0, Math.PI * 2, false).getPoints(64);
  }, [planetDistance, planetInclination]);



  return (
    <>
      {/* <Line points={lineFromZeroOrbitToPlanet2} color="white" lineWidth={1} transparent={true} opacity={0.4} /> */}
      {/* <Line points={lineFromZeroOrbitToPlanet} color="white" lineWidth={1} transparent={true} opacity={0.3} /> */}
      {/* <Trail local width={size * 100} length={5} color={"white"} attenuation={(t) => t * t} target={refPlanet} /> */}
      <PlanetHUDComponent planetName={planetName} />
      <group>
        {true && (
          <group>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <Line points={pointsDependOnInclination} color={"white"} lineWidth={1} transparent={true} opacity={0.2} />
            </mesh>
            <mesh rotation={[Math.PI / 2 + (planetInclination), 0, 0]}>
              <Line points={points} color={"white"} lineWidth={1} />
            </mesh>
          </group>
        )}
        <group ref={planetPositionRef} rotation={[0, 0, 0]}>
          {/* <InfoAboutObject ref={refPlanet} positionText={positionText} offset={size} params={planetParams} setActiveObjectName={setActiveObjectName} /> */}
          {/* <group ref={refPlanet2} > */}
            {/* <group>
              {moons.map((moon, index) => {
                return <CosmicSphere key={index} planetsPositionCollection={planetsPositionCollection} {...moon} />;
              } )}
            </group> */}
            <Sphere args={[planetSize]} onClick={() => {}}>
              <meshStandardMaterial map={planetTexture} />
            </Sphere>
          {/* </group> */}
        </group>
      </group>
    </>
  );
}

const PlanetHUDComponent = ({ planetName }) => {
  const planetPositionRef = useRef(new THREE.Vector3(0, 0, 0)); // Assuming initial position
  const [updateTrigger, setUpdateTrigger] = useState(0); // Trigger state for re-rendering

  useEffect(() => {
    const unsubscribe = useSolarSystemStore.subscribe(
      (state) => {
        const newPosition = state.properties[planetName]?.position;
        if (newPosition) {
          planetPositionRef.current = newPosition; // Update position reference
          setUpdateTrigger(prev => prev + 1); // Trigger re-render
        }
      },
      (state) => state.properties[planetName]
    );
    return unsubscribe;
  }, [planetName]);

  // Calculate line points dynamically on each render
  const lineFromZeroOrbitToPlanet = [new THREE.Vector3(0, 0, 0), planetPositionRef.current];
  const lineFromZeroOrbitToPlanet2 = [new THREE.Vector3(planetPositionRef.current.x, 0, planetPositionRef.current.z), planetPositionRef.current];

  // const lineFromZeroOrbitToPlanet2 = useMemo(() => {
  //   // two points, one at the center and one at the planet
  //   const planetPosition = refPlanet.current?.position || new THREE.Vector3(0, 0, 0);
  //   const twoAxisPostion = new THREE.Vector3(planetPosition.x, 0, planetPosition.z);
  //   const coordArray = [twoAxisPostion, planetPosition];

  //   return coordArray;
  // }, [updateTrigger]);


  return (
    <>
      <Line points={lineFromZeroOrbitToPlanet} color="white" lineWidth={1} transparent={true} opacity={0.3}/>
      <Line points={lineFromZeroOrbitToPlanet2} color="white" lineWidth={1} transparent={true} opacity={0.3}/>
    </>
  );
};

const SunComponent = () => {
  const createSunTexture = useTexture(sunTexture);
  const sunData = useSolarSystemStore((state) => state.celestialBodies.stars.sun);
  const relativeScale = useSystemStore.getState().objectsRelativeScale;
  const sunSize = sunData?.volumetricMeanRadiusKm / 1000 ?? 0.1;
  const calculatedSunSize = calculateRelativeScale(sunSize, relativeScale);


  // const [sunSize, setSunSize] = useState(0.1);

  // useEffect(() => {
  //   const sunData = useSolarSystemStore.getState().celestialBodies.stars.sun;
  //   const relativeScale = useSystemStore.getState().objectsRelativeScale;
  //   const calculatedSunSize = calculateRelativeScale(sunData.volumetricMeanRadiusKm, relativeScale);
  //   setSunSize(calculatedSunSize);
  //   console.log("sun size", calculatedSunSize);
  // }, []);

  console.log("sun size", calculatedSunSize);


  return (
    <group>
      {/* <pointLight position={[0, 0, 0]} intensity={1} distance={500} /> */}
      <Sphere args={[calculatedSunSize]}>
        {/* <meshStandardMaterial /> */}
        <meshStandardMaterial map={createSunTexture} emissive="orange" emissiveIntensity={2} toneMapped={false} />
      </Sphere>
    </group>
  );
}

const GeneratePlanets = () => {

  const getPlanetsData = useSolarSystemStore((state) => state.celestialBodies.planets);

  const createEarthTexture = useTexture(earthTexture);
  const createJupiterTexture = useTexture(jupiterTexture);
  const createMarsTexture = useTexture(marsTexture);
  const createMercuryTexture = useTexture(mercuryTexture);
  const createNeptuneTexture = useTexture(neptuneTexture);
  const createSaturnTexture = useTexture(saturnTexture);
  const createUranusTexture = useTexture(uranusTexture);
  const createVenusTexture = useTexture(venusTexture);

  const mapedTextures = {
    earth: createEarthTexture,
    jupiter: createJupiterTexture,
    mars: createMarsTexture,
    mercury: createMercuryTexture,
    neptune: createNeptuneTexture,
    saturn: createSaturnTexture,
    uranus: createUranusTexture,
    venus: createVenusTexture,
  };

  
  const planetsComposition = Object.keys(getPlanetsData).map((planetName, index) => {
    const planetTexture = mapedTextures[planetName];
    return <PlanetComponent key={index} planetName={planetName} params={getPlanetsData[planetName]} planetTexture={planetTexture} />;
  });

  return (
    <>
      {planetsComposition}
    </>
  )

}

const CosmicSphere = (params) => {
  const {
    dist = 1,
    size = 1,
    showOrbit = false,
    orbitSpeed = 1,
    posOffset = 0,
    axisRotationSpeed = 1,
    planetParams,
    planetsPositionCollection,
    setActiveObjectName,
    orbitAngleOffset,
  } = params;

  const refPlanet2 = useRef();
  const refPlanet = useRef();
  const refOrbit = useRef();

  

  // const refPlanetRealtimePosition = refPlanet.current && refPlanet.current.position || new THREE.Vector3(0, 0, 0);



  // useEffect(() => {
  //   console.log("planet data", planetParams.name, planetParams);
  // }, []);

  const [objectSelected, setObjectSelected] = useState(false);
  const [trackPosition, setTrackPosition] = useState(false);

  // const [updateTrigger, setUpdateTrigger] = useState(0);

  // useEffect(() => {
  //   console.log("update trigger", updateTrigger);
  // }, [updateTrigger]);

  
  // const [currentPosition, setCurrentPosition] = useState([0, 0, 0]);
  // const currentPositionRef = useRef(new THREE.Vector3(0, 0, 0));

  // useEffect(() => {
  //   if (trackPosition) {
  //     // console.log("track position", trackPosition);
  //     setActiveItemPosition(currentPosition);
  //     // console.log("active item position", setActiveItemPosition
  //   }
  // }, [currentPosition, trackPosition]);

  const createEarthTexture = useTexture(earthTexture);
  const createJupiterTexture = useTexture(jupiterTexture);
  const createMarsTexture = useTexture(marsTexture);
  const createMercuryTexture = useTexture(mercuryTexture);
  const createNeptuneTexture = useTexture(neptuneTexture);
  const createSaturnTexture = useTexture(saturnTexture);
  const createUranusTexture = useTexture(uranusTexture);
  const createVenusTexture = useTexture(venusTexture);

  const mapedTextures = {
    earth: createEarthTexture,
    jupiter: createJupiterTexture,
    mars: createMarsTexture,
    mercury: createMercuryTexture,
    neptune: createNeptuneTexture,
    saturn: createSaturnTexture,
    uranus: createUranusTexture,
    venus: createVenusTexture,
  };

  const planetTexture = mapedTextures[planetParams.name];
  const orbitInclination = degreesToRadians(planetParams.orbitInclinationDeg + orbitAngleOffset) || 0;

  const [updateTrigger, setUpdateTrigger] = useState(0);
  // const lineFromZeroOrbitToPlanetRef = useRef([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)]);
  // const infoPlanetPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  
  const moons = useMemo(() => {
    if (planetParams.moons) {
      return planetParams.moons.map((moon, index) => {
        return {
          name: moon.name,
          dist: moon.distanceToPlanetKm / 2000000,
          size: moon.diameterKm /10,
          orbitSpeed: orbitSpeed / (moon.siderealOrbitPeriodDays || 1),
          axisRotationSpeed: axisRotationSpeed / (moon.siderealRotationPeriodHrs || 1),
          showOrbit: true,
          posOffset: posOffset,
          planetParams: moon,
        };
      });
    }
    return [];
  }, [planetParams]);


  useFrame((state, delta) => {

    // console.log("planet position", state);

    // refOrbit.current.rotation.y += delta * (Math.PI * 2) * orbitSpeed
    const t = ((state.clock.getElapsedTime() * Math.PI * 2) / 60 / 60 / 24 / 365) * orbitSpeed;
    const position = new THREE.Vector3(
      Math.cos(t - posOffset) * dist,
      0,
      Math.sin(t - posOffset) * dist
    );

    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), orbitInclination);
    position.applyQuaternion(quaternion);

    

    refPlanet.current.position.copy(position);
    refPlanet.current.rotation.y = (refPlanet.current.rotation.y - ((Math.PI * 2 * delta) / 60 / 60) * axisRotationSpeed) % (Math.PI * 2);


    const frameRate = 30; // Desired frame rate
    const frameInterval = 1 / frameRate; // Interval between frames

    if (state.clock.getElapsedTime() % frameInterval < delta) {
      setUpdateTrigger(prev => (prev + 1) % 1000); // Changing this state will cause a re-render
    }

    planetsPositionCollection.current[planetParams.name] = position;

  });

  // console.log("planet position", refPlanetRealtimePosition);


  const points = useMemo(
    () => new THREE.EllipseCurve(0, 0, dist, dist, 0, Math.PI * 2, false).getPoints(64 * 3),
    [dist]
  );

  const pointsDependOnInclination = useMemo(() => {
    const ellipseSize = dist * Math.cos(orbitInclination);
    return new THREE.EllipseCurve(0, 0, dist, ellipseSize, 0, Math.PI * 2, false).getPoints(64);
  }, [dist, orbitInclination]);


  // useEffect(() => {
  //   console.log("planetsPositionCollection", planetsPositionCollection.current);
  // }, [planetsPositionCollection, updateTrigger]);

  const lineFromZeroOrbitToPlanet = useMemo(() => {

    return [new THREE.Vector3(0, 0, 0), refPlanet.current?.position || new THREE.Vector3(0, 0, 0)];
  }, [updateTrigger]);


  const lineFromZeroOrbitToPlanet2 = useMemo(() => {
    // two points, one at the center and one at the planet
    const planetPosition = refPlanet.current?.position || new THREE.Vector3(0, 0, 0);
    const twoAxisPostion = new THREE.Vector3(planetPosition.x, 0, planetPosition.z);
    const coordArray = [twoAxisPostion, planetPosition];

    return coordArray;
  }, [updateTrigger]);

  const positionText = useMemo(() => {
    const planetPosition = refPlanet.current?.position || new THREE.Vector3(0, 0, 0);
    return `${planetPosition.x.toFixed(2)} ${planetPosition.y.toFixed(2)} ${planetPosition.z.toFixed(2)}`;
  }, [updateTrigger]);

  return (
    <>
      <Line points={lineFromZeroOrbitToPlanet2} color="white" lineWidth={1} transparent={true} opacity={0.4} />
      <Line points={lineFromZeroOrbitToPlanet} color="white" lineWidth={1} transparent={true} opacity={0.3} />
      {/* <Trail local width={size * 100} length={5} color={"white"} attenuation={(t) => t * t} target={refPlanet} /> */}
      <group rotation={[0, 0, 0]}>
        {showOrbit && (
          <group>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <Line points={pointsDependOnInclination} color={"white"} lineWidth={1} transparent={true} opacity={0.2} />
            </mesh>
            <mesh rotation={[Math.PI / 2 + (orbitInclination), 0, 0]}>
              <Line points={points} color={"white"} lineWidth={1} />
            </mesh>
          </group>
        )}
        <group ref={refPlanet} rotation={[0, 0, 0]}>
          {/* <Text color="white" fontSize={0.1} position={[0, size * 1.5, 0]} rotation={[0, 0, 0]} children={refPlanet.current.position.x} /> */}
          <InfoAboutObject ref={refPlanet} positionText={positionText} offset={size} params={planetParams} setActiveObjectName={setActiveObjectName} />
          {/* <InfoAboutObject ref={refPlanet} offset={size} params={planetParams} setActiveObjectName={setActiveObjectName} /> */}
          {/* some hui around the planets */}

          <group ref={refPlanet2} >
            {/* <Sphere args={[0.04]} /> */}
            {/* <group>
              <Octahedron args={[size * 1.5, 2]} scale={[1, 1, 1]}>
                <meshStandardMaterial color="orange" wireframe={true} />
              </Octahedron>
            </group> */}
            <group>
              {moons.map((moon, index) => {
                return <CosmicSphere key={index} planetsPositionCollection={planetsPositionCollection} {...moon} />;
              } )}
            </group>
            {/* <mesh ref={refOrbit} rotation={[Math.PI / 2 + (orbitInclination), 0, 0]}>
              <Line points={points} color={"white"} lineWidth={1} transparent={true} opacity={0.3} />
            </mesh> */}
            <Sphere args={[size]} onClick={
              (e) => {
                console.log("clicked on planet", planetParams.name);

                setActiveObjectName(planetParams.name);
                // setTrackPosition(true);
                // setObjectSelected(true);
              }
            }>
              {/* <meshStandardMaterial color="orange" /> */}
              {planetTexture && <meshStandardMaterial map={planetTexture} />}
            </Sphere>
          </group>
        </group>
      </group>
    </>
  );
};


export default App;
