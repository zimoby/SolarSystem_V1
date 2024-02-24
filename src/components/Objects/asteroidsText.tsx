import { CurveModifier } from "@react-three/drei"
import { useMemo, useRef } from "react"
import { CatmullRomCurve3, Vector3 } from "three"
import { FontLoader, TextGeometry } from "three-stdlib";

import testFont from "three/examples/fonts/helvetiker_regular.typeface.json";

export const AsteroidsText = () => {

  const handlePos = Array.from({ length: 360 }, (_, i) => {
    const angle = (i * Math.PI) / 180;
    const distance = 10;
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    return new Vector3(x, 0, z);
  });

  // @ts-expect-error i'm tired of this
  const font = new FontLoader().parse(testFont);

  const curveRef = useRef()

  const curve = useMemo(() => new CatmullRomCurve3([...handlePos], true, 'centripetal'), [handlePos])

  const textGeo = useMemo(() => {
    const size = 2
    const height = 0.1
    const curveSegments = 64
    return new TextGeometry("Kuiper Belt", {
      font,
      size,
      height,
      curveSegments,
    })
  }, [font])

  // useEffect(() => {
  //   if(curveRef.current && curve) {
  //     const tangent = curve.getTangent(0).normalize();
  //     curveRef.current.rotation.setFromVector3(tangent);
  //   }
  // }, [curve]);
  

  return (

    <CurveModifier
      // @ts-expect-error i'm tired of this
      ref={curveRef}
      curve={curve}
    >
      <mesh position={[0, 0, 0]} rotation={[0,0, 0]}>
        <meshPhongMaterial color="white" />
        <primitive object={textGeo} />
      </mesh>
    </CurveModifier>

  )
}
