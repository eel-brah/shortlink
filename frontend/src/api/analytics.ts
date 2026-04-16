import { api } from "../utils/axios"

export const getAnalytics = async (shortCode: string) => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const res = await api.get(`/analytics/${shortCode}?tz=${tz}`)
  return res.data
}

export const getGlobalAnalytics = async () => {
  const res = await api.get("/analytics/global")
  return res.data
}
