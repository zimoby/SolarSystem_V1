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

    const objInfoIntoArray = useMemo(() => {
        return Object.entries(objectsInfo[activeObjectName] || {})
            .filter(([name]) => (name !== "moons" && name !== "name"))
            .map(([name, value]) => ({ name, value: String(value) }));
    }, [objectsInfo, activeObjectName]);

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
            <div className="relative p-2 select-none">
                <div 
                    className="absolute top-0 left-0 font-sans text-lg -m-1 text-red-600 cursor-pointer hover:scale-150 hover:text-neutral-50"
                    onClick={() => setShowMoreActiveInfo(!showMoreActiveInfo)}
                >
                    +
                </div>
                <div className="uppercase font-bold text-2xl font-sans">
                    {activeObjectName}
                </div>
                <animated.div style={{ overflow: 'hidden', ...animation }}>
                    <div ref={showMoreActiveInfo ? ref : undefined} className="text-2xs leading-3">
                        {objInfoIntoArray.map((el) => (
                            <div key={el.name}>
                                {el.name}: {el.value}
                            </div>
                        ))}
                    </div>
                </animated.div>
            </div>
        </div>
    );
};
