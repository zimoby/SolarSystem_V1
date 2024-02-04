import { useSystemStore } from "../store/systemStore";

export const useSystemOperations = () => {
    const setActiveObjectName = useSystemStore(state => state.setActiveObjectName);

    const switchActiveObject = (name) => {
        console.log("switchActiveObject", name);
        setActiveObjectName(name);
    }

    return {
        switchActiveObject,
    }
};
