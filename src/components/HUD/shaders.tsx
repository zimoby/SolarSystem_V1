import { Sphere, shaderMaterial } from "@react-three/drei"
import { useMemo, useRef } from "react"
import { Color, DoubleSide, RawShaderMaterial, ShaderMaterial } from "three";
import { extend, useFrame } from "@react-three/fiber";

import testVertexShader from "./shaders/test/vertex.glsl";
import testFragmentShader from "./shaders/test/fragment.glsl";

// console.log("testVertexShader", testVertexShader);

const ColorShiftMaterial = shaderMaterial(
    {
        uTime: 0,
        uFrequency: {x: 2.0, y: 2.0},
        uAmplitude: 1,
        side: DoubleSide,
    },
    testVertexShader,
    testFragmentShader,
)

extend({ ColorShiftMaterial })

// const StarsMaterial = shaderMaterial(
//     {
//         uTime: 0,
//         uColorStart: new Color(0xff0000),
//         uColorEnd: new Color(0x0000ff),
//     },
//     vertexShader: testVertexShader,
//     fragmentShader: testFragmentShader
// )

// extend({ StarsMaterial })


export const CenterShader = () => {

    // const simpleShader = useMemo(() => {
    //     return {
    //         uniforms: {
    //             color: { value: new Color(0xff0000) }
    //         },
    //         vertexShader: `
    //             varying vec3 vNormal;
    //             void main() {
    //                 vNormal = normal;
    //                 gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    //             }
    //         `,
    //         fragmentShader: `
    //             uniform vec3 color;
    //             varying vec3 vNormal;
    //             void main() {
    //                 float intensity = pow(0.5 - dot(vNormal, vec3(0, 0, 1)), 2.0);
    //                 gl_FragColor = vec4(color, 1.0) * intensity;
    //             }
    //         `
    //     }
    // }, []);

    const material = useMemo(() => {
        return new ShaderMaterial({
            // uniforms: {
            //     uTime: { value: 0 },
            //     uColorStart: { value: new Color(0xff0000) },
            //     uColorEnd: { value: new Color(0x0000ff) }
            // },
            vertexShader: testVertexShader,
            fragmentShader: testFragmentShader,
            side: DoubleSide
        })
    }, []);

    const matRef = useRef<ShaderMaterial>(null);

    console.log("matRef", matRef.current);

    useFrame((state, delta) => {
        // material.uniforms.uTime.value = state.clock.getElapsedTime();
        // matRef.current?.uniforms.uTime.value = state.clock.getElapsedTime();
        if (matRef.current) {
            matRef.current.uniforms.uTime.value += delta
            // matRef.current.uniforms.uTime.value.set(state.clock.getElapsedTime())

        }
    });


    return (
        <>
            {/* <mesh> */}
                {/* <sphereBufferGeometry args={[10, 32, 32]} /> */}
                {/* <shaderMaterial /> */}
            {/* </mesh> */}
            <mesh>
                {/* <sphereGeometry args={[10, 32, 32]} /> */}
                <planeGeometry args={[10, 10, 64, 64]} />
                <colorShiftMaterial ref={matRef} />
            </mesh>

            {/* <Sphere args={[10, 32, 32]} material={material} /> */}
                {/* <meshBasicMaterial attach="material" color="red" /> */}
                {/* <shaderMaterial
                    // attach="material"
                    // args={[material]}
                    // uniforms-uColorStart-value={new Color(0xff0000)}
                    // uniforms-uColorEnd-value={new Color(0x0000ff)}
                /> */}
            {/* </Sphere> */}
            {/* <StarsMaterial /> */}
        </>
    )
}