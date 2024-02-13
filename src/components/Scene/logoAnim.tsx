import { Box, Center, Html, Svg } from "@react-three/drei"
import { svgLogo } from "../../assets/logo"
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { lerp } from "three/src/math/MathUtils.js";



export const LogoIntroAnimation = () => {
    const logoRef = useRef();

    const { viewport } = useThree();

    // console.log("viewport", logoRef.current.boundingSphere.radius);

    // calculate logoRef boundaries


    useFrame((state, delta) => {
        // logoRef.current.rotation.y += delta;
        const time = state.clock.getElapsedTime();

        if (time > 1) {
            logoRef.current.position.x = lerp(logoRef.current.position.x, -(viewport.width / 2 -4), 0.1);
            // logoRef.current.position.y = lerp(logoRef.current.position.y, (viewport.height / 2 ), 0.1);
            logoRef.current.position.y = lerp(logoRef.current.position.y, (viewport.height / 2 ), 0.1);
        }
        // if (time > 1) {
        //     // logoRef.current.position.x = lerp(logoRef.current.position.x, -(viewport.width / 2 -4), 0.1);
        // }
    })

    return (
        // <Center top left>
        <group ref={logoRef}>
            {/* <Box args={[1, 1, 1]} /> */}
            <Html center>
                {/* <div className="w-full h-full absolute top-0 left-0 select-none m-3"> */}
                    <div className="m-5">
                        {svgLogo}
                    </div>
                {/* </div> */}
            </Html>
        </group>
        // </Center>
        // <Svg src="../../assets/logo.svg" scale={1} position={[0, 0, 0]} />
        // <div className="w-full h-full select-none">
        //     <div className="flex h-10 w-10  ">
        //         {svgLogo}
        //     </div>
        // </div>
    )
}