import { api } from "../utils/axios"

export const registerUser = async (data: {
  username: string
  email: string
  password: string
}) => {
  const res = await api.post("/auth/register", data)
  return res.data
}

export const loginUser = async (data: {
  username?: string
  email?: string
  password: string
}) => {
  const formData = new URLSearchParams()

  formData.append("username", data.email || data.username || "")
  formData.append("password", data.password)

  const res = await api.post("/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })

  return res.data
}

export const logoutUser = async () => {
  const res = await api.post("/auth/logout")
  return res.data
}

export const refreshAccessToken = async () => {
  const res = await api.post("/auth/refresh")
  return res.data
}
