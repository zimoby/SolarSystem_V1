import { svgLogo } from "../../assets/logo"

export const OverlayElements = () => {
    return (
        <>
            <div className="absolute bottom-0 right-0">
                <div className="flex flex-col">
                    <div className=" *:text-xs flex flex-row space-x-3 opacity-50  p-2 text-neutral-50">
                    <p>Three.js Journey</p>
                    <p>|</p>
                    <p>Challenge 008: Solar System</p>
                    <p>|</p>
                    <p>Author: Bondartsov Denys</p>
                </div>
                </div>
            </div>
            <div className="absolute top-0 left-0 select-none m-3 text-neutral-50">
                <div className="flex flex-row text-2xs space-x-4 divide-x-2 divide-white/50">
                    <div className="">
                        {svgLogo}
                    </div>
                    <div className="*:pl-4 flex flex-col">
                        <p>Choose a planet with arrows ⟵ / ⟶</p>
                        <p>Or click on the planet info</p>
                    </div>
                    <div className="*:pl-4 flex flex-col -space-y-1">
                        <p>Planets size increased to x1200</p>
                        <p>Sun size increased to x24</p>
                        <p>Planets rotation decreased to x100</p>
                        <p>Moons rotation decreased to x500</p>
                    </div>
                </div>
            </div>
        </>
    )
}