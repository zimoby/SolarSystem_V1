import { useControls } from "leva";
import { useEffect } from "react";
import { useSystemStore } from "../store/systemStore";

export const useSyncControlsWithStore = () => {
  const { timeSpeed, timeOffset, objectsDistance, objectsRelativeScale, orbitAngleOffset } =
    useControls({
      // solarScale: {
      //   value: 1,
      //   min: 1,
      //   max: 10,
      //   step: 1,
      // },
      timeSpeed: {
        value: 50,
        min: 1,
        max: 100,
        step: 1,
      },
      timeOffset: {
        value: 0,
        min: -365,
        max: 365,
        step: 1,
      },
      objectsDistance: {
        value: 2,
        min: 1,
        max: 10,
        step: 0.1,
      },
      objectsRelativeScale: {
        value: 1,
        min: 1,
        max: 10,
        step: 1,
      },
      orbitAngleOffset: {
        value: 0,
        min: 0,
        max: 360,
        step: 1,
      },
    });

  const updateSystemSettings = useSystemStore((state) => state.updateSystemSettings);

  useEffect(() => {
    updateSystemSettings({
      solarScale: Math.pow(objectsDistance, 2),
      timeSpeed: timeSpeed === 1 ? 1 : timeSpeed * 100000,
      timeOffset,
      objectsDistance,
      objectsRelativeScale,
      orbitAngleOffset,
    });
  }, [
    
    timeSpeed,
    timeOffset,
    objectsDistance,
    objectsRelativeScale,
    orbitAngleOffset,
    updateSystemSettings,
  ]);
};
