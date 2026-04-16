import { BASE_URL } from "./config"

export const getImageUrl = (path?: string | null) => {
  if (!path) return undefined
  console.log(`${BASE_URL}${path}`)
  return `${BASE_URL}${path}`
}
