
export type ToastType = "error" | "success" | "warning" | "info"

export type Link = {
  id: number
  short_code: string
  original_url: string
  clicks: number
  created_at: string
  expires_at?: string
}
