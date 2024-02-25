import { useEffect, useState } from "react";
import { useSolarStore } from "../../store/systemStore";

import "./styles.css";

const backgroundSliderCalc = (value: number, minVal: number, maxVal: number): string => {
    const percent = maxVal === minVal ? 100 : ((value - minVal) / (maxVal - minVal)) * 100;
    return `linear-gradient(to right, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.3) ${percent}%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.1) 100%)`
}

type SliderWithInputProps = {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onUpdate: (value: number) => void;
};

type CheckBoxProps = {
    label: string;
    value: boolean;
    onUpdate: (value: boolean) => void;
};

const CheckBox = ({ label, value, onUpdate }: CheckBoxProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(e.target.checked);
    };

    return (
        <div className="relative flex flex-row text-xs justify-start items-center">
            <div className="relative w-32 truncate select-none">
                {label}
            </div>
            <input
                type="checkbox"
                checked={value}
                onChange={handleChange}
            />
        </div>
    );
}

const SliderWithInput = ({ label, value, min, max, step, onUpdate }: SliderWithInputProps) => {
    const [localValue, setLocalValue] = useState<number>(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(Number(e.target.value));
    };

    const allChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(Number(e.target.value));
        onUpdate(Number(e.target.value));
    }

    const handleMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
        onUpdate(Number(e.currentTarget.value));
    };

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <div className="relative flex flex-row text-xs justify-center items-center">
            <div className="relative w-20 truncate select-none">
                {label}
            </div>
            <input
                className="h-2 w-24 cursor-pointer appearance-none rounded-sm"
                style={{ 
                    background: backgroundSliderCalc(localValue, min, max)
                }}
                type="range"
                min={min}
                max={max}
                value={localValue}
                step={step}
                onChange={handleChange}
                onMouseUp={handleMouseUp}
            />
            <input
                className="h-hull ml-2 m-0 w-10 rounded-sm border-transparent bg-black/20 p-0 text-center text-xs text-white"
                min={min.toString()}
                max={max.toString()}
                step={step.toString()}
                type="number"
                value={localValue}
                onChange={allChange}
            />
        </div>
    );
}

export const SolarSystemControls = () => {
    const updateSystemSettings = useSolarStore((state) => state.updateSystemSettings);

    const disableTrash = useSolarStore((state) => state.disableTrash);
    const disableRandomObjects = useSolarStore((state) => state.disableRandomObjects);
    const timeSpeed = useSolarStore((state) => state.timeSpeed);
    const timeOffset = useSolarStore((state) => state.timeOffset);
    const objectsDistance = useSolarStore((state) => state.objectsDistance);
    const objectsRelativeScale = useSolarStore((state) => state.objectsRelativeScale);
    const orbitAngleOffset = useSolarStore((state) => state.orbitAngleOffset);

    const handleSliderUpdate = (value: number | boolean, param: string, correction: number = 1) => {
        updateSystemSettings({ [param]: Number(value) * correction });
    };

    return (
        <div className="absolute z-50 top-0 right-0 m-2 flex flex-col space-y-0">
            <div className=" space-y-1 bg-black/20 py-1 px-2 divide-y divide-white/40 rounded-md">
                <div className=" space-y-1 ">
                    <SliderWithInput 
                        label="Time Speed"
                        value={timeSpeed / 100000}
                        min={0}
                        max={100}
                        step={1}
                        onUpdate={(e) => handleSliderUpdate(e, "timeSpeed", 100000)}
                    />
                    <SliderWithInput 
                        label="Time Offset"
                        value={timeOffset}
                        min={-360}
                        max={360}
                        step={1}
                        onUpdate={(e) => handleSliderUpdate(e, "timeOffset")}
                    />
                </div>
                <div className=" space-y-1  pt-1">
                    <SliderWithInput 
                        label="Relative Distance"
                        value={objectsDistance}
                        min={1}
                        max={5}
                        step={1}
                        onUpdate={(e) => handleSliderUpdate(e, "objectsDistance")}
                    />
                    <SliderWithInput 
                        label="Relative Scale"
                        value={objectsRelativeScale}
                        min={1}
                        max={10}
                        step={1}
                        onUpdate={(e) => handleSliderUpdate(e, "objectsRelativeScale")}
                    />
                    <SliderWithInput 
                        label="Orbit Rotation"
                        value={orbitAngleOffset}
                        min={0}
                        max={360}
                        step={1}
                        onUpdate={(e) => handleSliderUpdate(e, "orbitAngleOffset")}
                    />
                </div>
                <div className=" space-y-1 pt-1">
                    <CheckBox
                        label="Disable Asteroids"
                        value={disableTrash}
                        onUpdate={() => handleSliderUpdate(!disableTrash, "disableTrash")}
                    />
                    <CheckBox
                        label="Disable Objects"
                        value={disableRandomObjects}
                        onUpdate={() => handleSliderUpdate(!disableRandomObjects, "disableRandomObjects")}
                    />
                </div>
            </div>
        </div>
    );
}