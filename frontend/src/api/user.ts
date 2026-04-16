import { api } from "../utils/axios"


export const getMe = async () => {
  const res = await api.get("/user/me")
  return res.data
}

export const updateProfile = async (data: any) => {
  const res = await api.put("/user/me", data)
  return res.data
}

export const deleteProfile = async () => {
  await api.delete("/user/me")
}

export const uploadAvatar = async (file: File) => {
  const form = new FormData()
  form.append("file", file)

  const res = await api.post("/user/me/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  })

  return res.data
}

export const deleteAvatar = async () => {
  await api.delete("/user/me/avatar")
}
