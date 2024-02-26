import { svgLogo } from "../../assets/logo"
import {
  moonsDistanceFactor,
  moonsRotationSpeed,
  objectsRotationSpeed,
  planetsScaleFactor,
  relativeEarthSizeDependOnDistance,
  starsScaleFactor,
} from "../../data/solarSystemData"
// import { SolarSystemControls } from "./sliders"

export const OverlayElements = () => {
  return (
    <>
      <div className="absolute bottom-0 right-0">
        <div className="flex flex-col">
          <div className=" *:text-xs flex flex-row space-x-3 p-2 text-neutral-50/50">
            <a className="text-neutral-50/50 hover:text-orange-500 cursor-pointer" href="https://threejs-journey.com" target="_blank">Three.js Journey</a>
            <p>|</p>
            <a className="text-neutral-50/50 hover:text-orange-500 cursor-pointer" href="https://github.com/zimoby/SolarSystem_V1" target="_blank">Challenge 008: Solar System</a>
            <p>|</p>
            <p>
              <a className="text-neutral-50/50 hover:text-orange-500 cursor-pointer" href="https://www.notion.so/zimoby" target="_blank">
                Bondartsov Denys
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className="absolute top-0">
        {/* <div className="flex flex-row justify-between" > */}
          <div className="w-full select-none m-3 text-neutral-50">
            <div className="flex flex-wrap just text-2xs space-x-4 divide-x-2 divide-white/50">
            <a className="fill-neutral-50 hover:fill-orange-500 cursor-pointer" href="https://github.com/zimoby/SolarSystem_V1" target="_blank">{svgLogo}</a>
              {/* <div className="*:pl-4 flex flex-col leading-3 -space-y-1">
                            <p>Data driven Solar system</p>
                        </div> */}
              <div className="*:pl-4 flex flex-col leading-4 -space-y-1">
                <p>Planets size increased to x{planetsScaleFactor / relativeEarthSizeDependOnDistance}</p>
                <p>Sun size increased to x{starsScaleFactor / relativeEarthSizeDependOnDistance}</p>
                <p>Planets rotation decreased to x{objectsRotationSpeed}</p>
                <p>Moons rotation decreased to x{moonsRotationSpeed}</p>
                <p>Moons distance from planet decreased to x{Math.round(moonsDistanceFactor)}</p>
              </div>
              <div className="*:pl-4 flex flex-col leading-3">
                <p>Choose a planet with arrows ⟵ / ⟶</p>
                <p>Or click on the planet info</p>
              </div>
            </div>
            {/* <SolarSystemControls /> */}
          </div>

        </div>

      {/* </div> */}
    </>
  )
}
