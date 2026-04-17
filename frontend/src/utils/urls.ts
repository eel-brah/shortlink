import { BASE_URL } from "./config"

export const getImageUrl = (path?: string | null) => {
  if (!path) return undefined
  return `${BASE_URL}${path}`
}
