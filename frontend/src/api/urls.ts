import { api } from "../utils/axios"

export interface ShortenPayload {
  url: string
  custom_alias?: string
  expires_at?: string
}

export interface UrlResponse {
  original_url: string
  short_code: string
  is_active: boolean
  expires_at: string | null
  click_count: number
}

export const shortenUrl = async (
  data: ShortenPayload
): Promise<UrlResponse> => {
  const res = await api.post("/urls/", data)
  return res.data
}
