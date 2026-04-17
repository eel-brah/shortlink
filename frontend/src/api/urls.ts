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

export const getMyUrls = async (page: number, size: number) => {
  const res = await api.get("/urls/my-urls", {
    params: { page, size },
  })
  return res.data
}

export const deleteUrl = async (shortCode: string) => {
  await api.delete(`/urls/${shortCode}`)
}

export const updateUrl = async (
  shortCode: string,
  data: {
    original_url?: string
    custom_alias?: string
    is_active?: boolean
    expires_at?: string | null
  }
) => {
  const res = await api.put(`/urls/${shortCode}`, data)
  return res.data
}

export const checkAliasAvailability = async (alias: string) => {
  const res = await fetch(`/urls/check-alias?alias=${alias}`);
  return res.json(); 
};
