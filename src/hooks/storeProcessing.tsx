import { useSolarStore } from "../store/systemStore"

export const updateActiveName = (name: string) => {
  useSolarStore.getState().updateSystemSettings({ activeObjectName: name })
  // console.log("updateActiveName", name)
}
