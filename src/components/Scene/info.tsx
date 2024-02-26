import { useState, useMemo, useEffect } from "react";
import { useSpring, animated, easings } from "@react-spring/web";
import { useSolarStore } from "../../store/systemStore";
import useMeasure from "react-use-measure";

export const ActiveObjectInfo = () => {
    const activeObjectName = useSolarStore((state) => state.activeObjectName);
    const objectsInfo = useSolarStore((state) => state.activeObjectInfo);
    const initialized = useSolarStore((state) => state.isInitialized);

    const [showMoreActiveInfo, setShowMoreActiveInfo] = useState(true);
    const [ref, bounds] = useMeasure();

    const groups = useMemo(() => ({
        "Physical Properties": ["equatorialRadiusKm", "polarRadiusKm", "volumetricMeanRadiusKm", "coreRadiusKm", "ellipticityFlattening", "mass10_24Kg", "meanDensityKgM3", "surfaceGravityMS2", "surfaceAccelerationMS2", "escapeVelocityKmS", "topographicRangeKm"],
        "Orbital Dynamics": ["semimajorAxis10_6Km", "perihelion10_6Km", "aphelion10_6Km", "orbitInclinationDeg", "orbitEccentricity", "meanOrbitalVelocityKmS", "maxOrbitalVelocityKmS", "minOrbitalVelocityKmS", "siderealOrbitPeriodDays", "tropicalOrbitPeriodDays"],
        "Rotational Dynamics": ["siderealRotationPeriodHrs", "lengthOfDayHrs", "obliquityToOrbitDeg", "inclinationOfEquatorDeg"],
        "Reflectivity and Radiation": ["bondAlbedo", "geometricAlbedo", "solarIrradianceWM2", "blackBodyTemperatureK"],
        "Miscellaneous": ["gMX10_6Km3S2", "momentOfInertiaIMR2", "j2X106", "numberOfNaturalSatellites", "planetaryRingSystem"]
    }), []);

    const objInfoIntoArray = useMemo(() => {
        const groupedInfo = [];

        const filteredInfo = Object.entries(objectsInfo[activeObjectName] || {}).filter(([name]) => (name !== "moons" && name !== "name" && name !== "anchorXYOffset"));
        for (const group in groups) {
            const groupEntries = filteredInfo.filter(([name]) => groups[group as keyof typeof groups].includes(name)).map(([name, value]) => ({ name, value: String(value) }));
            if (groupEntries.length > 0) {
                groupedInfo.push({ groupName: group, entries: groupEntries });
            }
        }

        return groupedInfo;
    }, [objectsInfo, activeObjectName, groups]);

    const animation = useSpring({
        from: { height: 0 },
        to: { height: showMoreActiveInfo ? bounds.height : 0 },
        config: {
            duration: 350,
            easing: easings.easeOutCubic, 
        },
    });

    useEffect(() => {
        if (!initialized) return;
    }, [activeObjectName, initialized]);

    return (
        <div className="absolute bottom-0 left-0 m-2">
            <div 
                className="relative top-2 -left-1 font-sans cursor-pointer text-lg text-red-600  hover:text-neutral-50"
                onClick={() => setShowMoreActiveInfo(!showMoreActiveInfo)}
            >
                +
            </div>
            <div className="relative p-2 ml-1 select-none bg-black/20 rounded-md">
                <div className="cursor-pointer hover:text-red-600"
                    onClick={() => setShowMoreActiveInfo(!showMoreActiveInfo)}
                >
                    <div className="uppercase font-bold text-2xl font-sans">
                        {activeObjectName}
                    </div>
                </div>
                <animated.div style={{ overflow: 'hidden', ...animation }}>
                    <div ref={showMoreActiveInfo ? ref : undefined} className="text-2xs leading-3 space-y-2">
                        {objInfoIntoArray.map((group) => (
                            <div key={group.groupName}>
                                <div className=" text-sm font-bold font-sans">{group.groupName}</div>
                                {group.entries.map((el) => (
                                    <div key={el.name}>
                                        {el.name}: {el.value}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </animated.div>
            </div>
        </div>
    );
};
