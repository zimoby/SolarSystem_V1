import { Effects } from "@react-three/drei"
import { extend } from "@react-three/fiber"
import { FilmPass, WaterPass, UnrealBloomPass, LUTPass } from 'three-stdlib'

extend({ WaterPass, UnrealBloomPass, FilmPass, LUTPass })

export const SolarEffects = () => {

    return (
        <Effects>
            {/* <unrealBloomPass args={[undefined, 1.25, 1, 0]} />
            <filmPass args={[0.2, 0.5, 1500, false]} /> */}
        </Effects>
    )

}