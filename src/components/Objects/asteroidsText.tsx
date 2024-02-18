import { CurveModifier, Text, Text3D } from "@react-three/drei"
import { useMemo, useRef } from "react"
import { CatmullRomCurve3, Vector3 } from "three"
import { TextGeometry } from "three-stdlib";

export const AsteroidsText = () => {

  const handlePos = Array.from({ length: 360 }, (_, i) => {
    const angle = (i * Math.PI) / 180;
    const x = Math.cos(angle);
    const z = Math.sin(angle);
    return new Vector3(x, 0, z);
  });

  // { x: 1, y: 0, z: - 1 },
  // { x: 1, y: 0, z: 1 },
  // { x: - 1, y: 0, z: 1 },
  // { x: - 1, y: 0, z: - 1 },

  const curveRef = useRef()

  const curve = useMemo(() => new CatmullRomCurve3([...handlePos], true, 'centripetal'), [handlePos])

  // const textGeo = useMemo(() => {
  //   const size = 3
  //   const height = 3
  //   const curveSegments = 12
  //   const bevelEnabled = true
  //   const bevelThickness = 0.03
  //   const bevelSize = 0.02
  //   return new TextGeometry("Kuiper Belt", {
  //     size,
  //     height,
  //     curveSegments,
  //     bevelEnabled,
  //     bevelThickness,
  //     bevelSize,
  //     bevelOffset: 0,
  //     bevelSegments: 10,
  //   })
  // }, [])
  

  return (

        // <Text3D color="white" fontSize={2} maxWidth={100} lineHeight={1} letterSpacing={0.02} textAlign="center">
        //   {("Kuiper Belt").toUpperCase()}
        // </Text3D>
    <group>
      {/* <Text3D smooth={1} lineHeight={0.5} letterSpacing={-0.025}>{`hello\nworld`}</Text3D> */}
    </group>
    // <CurveModifier ref={curveRef} curve={curve}>
    //   <mesh position={[0, 0, -0]} rotation={[0, 0, 0]}>
    //     <meshPhongMaterial color="white" />
    //     <primitive object={textGeo} />
    //   {/* <mesh> */}
    //   {/* <boxGeometry args={[10,1,1, 64,64,64]} /> */}
    // {/* </mesh> */}
    //     {/* <Text
    //       color="white"
    //       fontSize={2}
    //       maxWidth={100}
    //       lineHeight={1}
    //       letterSpacing={0.02}
    //       textAlign="center"
    //     >
    //       {("Kuiper Belt").toUpperCase()}
    //     </Text> */}
    //   </mesh>
    // </CurveModifier>

  )
}
