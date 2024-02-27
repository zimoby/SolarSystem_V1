import { useState } from "react"
import { planetsNamesOrder } from "../../data/solarSystemData"
import { useSolarStore } from "../../store/systemStore"
import { updateActiveInfo, updateActiveName } from "../../hooks/storeProcessing"

export const CelestialToggle = () => {
  const planetsWithSun = ["sun", ...planetsNamesOrder]
  const [hoveredIndex, setHoveredIndex] = useState(-1)
  const circleSize = 5

  const supportData = useSolarStore((state) => state.additionalProperties)
  const objectsInfo = useSolarStore((state) => state.activeObjectInfo)

  return (
    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-row space-x-5 select-none  cursor-pointer">
      {planetsWithSun.map((planetName, index) => {
        const planetScale = Math.pow(supportData[planetName]?.scale || 1, 1 / 3)
        const isIncludeMoons = objectsInfo[planetName]?.moons?.length ?? 0 > 0
        const ellipseScale = circleSize * planetScale * 3

        return (
          <div key={planetName + "circles"} className="w-5 h-5 flex justify-center items-center font-bold text-center font-sans text-2xl">
            <div
              className="absolute m-0 p-1 flex flex-col justify-center items-center hover:translate-y-3 fill-neutral-50 opacity-80 hover:fill-red-500 -space-y-1"
              onMouseEnter={() => {
                updateActiveInfo(planetName)
                setHoveredIndex(index)
              }}
              onMouseLeave={() => setHoveredIndex(-1)}
              onClick={() => updateActiveName(planetName)}
            >
              <svg width={ellipseScale * 3} height={ellipseScale * 3} className="">
                <circle cx="50%" cy="50%" r={circleSize * planetScale} />
                {isIncludeMoons && (
                  <ellipse
                    cx="50%"
                    cy="50%"
                    rx={ellipseScale}
                    ry={ellipseScale * 0.5}
                    transform={`rotate(-45, ${ellipseScale * 1.5}, ${ellipseScale * 1.5})`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                )}
              </svg>

              {index === hoveredIndex && <div className="relative transform text-2xs text-center font-mono uppercase">{planetName}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
