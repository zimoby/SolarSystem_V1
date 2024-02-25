import { useState } from "react";
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

const SliderWithInput = ({ label, value, min, max, step, onUpdate }: SliderWithInputProps) => {
    const [localValue, setLocalValue] = useState<number>(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(Number(e.target.value));
    };

    const handleMouseUp = () => {
        onUpdate(localValue);
    };

    return (
        <div className="relative flex flex-row text-xs justify-center items-center">
            <div className="relative flex w-20 truncate select-none">
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
                className="h-hull m-0 w-10 rounded-sm border-transparent bg-black/20 p-0 text-center text-xs text-white"
                min={min.toString()}
                max={max.toString()}
                step={step.toString()}
                type="number"
                value={localValue}
                onChange={handleChange}
            />
        </div>
    );
}

export const SolarSystemControls = () => {
    const updateSystemSettings = useSolarStore((state) => state.updateSystemSettings);

    const disableMoons = useSolarStore((state) => state.disableMoons);
    const disableTrash = useSolarStore((state) => state.disableTrash);
    const disableRandomObjects = useSolarStore((state) => state.disableRandomObjects);
    const timeSpeed = useSolarStore((state) => state.timeSpeed / 100000) ;
    const timeOffset = useSolarStore((state) => state.timeOffset);

    const handleSliderUpdate = (value: number, param: string) => {
        updateSystemSettings({ [param]: value * 100000 });
    };

    return (
        <div className="absolute z-50 top-0 right-0 m-2 flex flex-col space-y-0">
            <SliderWithInput 
                label="Time speed"
                value={timeSpeed}
                min={0}
                max={100}
                step={1}
                onUpdate={(e) => handleSliderUpdate(e, "timeSpeed")}
            />
        </div>
    );
}