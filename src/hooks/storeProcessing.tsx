import { useSystemStore } from "../store/systemStore";

export const updateActiveName = (name) => {
    useSystemStore.getState().updateSystemSettings({ activeObjectName: name });
    console.log("updateActiveName", name);
}