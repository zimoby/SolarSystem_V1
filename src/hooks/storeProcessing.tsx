import { useSolarStore } from "../store/systemStore"

export const updateActiveName = (name: string) => {
  useSolarStore.getState().updateSystemSettings({ activeObjectName: name })
  // console.log("updateActiveName", name)
}

export const updateActiveInfo = (name: string) => {
  useSolarStore.getState().updateSystemSettings({ activeObjectNameInfo: name })
  // console.log("updateActiveInfo", name)
}