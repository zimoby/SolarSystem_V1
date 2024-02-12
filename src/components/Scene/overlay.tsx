import { svgLogo } from "../../assets/logo"

export const OverlayElements = () => {
    return (
        <>
            <div className="absolute bottom-0 right-0">
                <div className="flex flex-col">
                    <div className="flex flex-row space-x-3 opacity-50  p-2">
                    <p className="text-white text-xs">Three.js Journey</p>
                    <p className="text-white text-xs">Challenge 008: Solar System</p>
                    <p className="text-white text-xs">Author: Bondartsov Denys</p>
                </div>
                </div>
            </div>
            <div className="absolute top-0 left-0 select-none m-3">
                <div className="flex h-10 w-10  ">
                    {svgLogo}
                </div>
            </div>
        </>
    )
}