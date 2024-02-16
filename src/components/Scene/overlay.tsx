import { svgLogo } from "../../assets/logo"

export const OverlayElements = () => {
    return (
        <>
            <div className="absolute bottom-0 right-0">
                <div className="flex flex-col">
                    <div className=" *:text-xs flex flex-row space-x-3 opacity-50  p-2 text-neutral-50">
                    <p>Three.js Journey</p>
                    <p>:</p>
                    <p>Challenge 008: Solar System</p>
                    <p>:</p>
                    <p>Author: Bondartsov Denys</p>
                </div>
                </div>
            </div>
            <div className="absolute top-0 left-0 select-none m-3 text-neutral-50">
                <div className="flex flex-row space-x-4 divide-x-2 divide-white/50">
                    <div className="">
                        {svgLogo}
                    </div>
                    <div className="flex flex-col">
                        <div className="text-xs pl-4">
                            {"Choose a planet with arrows ⟵ / ⟶"}
                        </div>
                        <div className="text-xs pl-4">
                            {"Or click on the planet info"}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}