import axios from "axios"
import { toast } from "../utils/toast"
import { refreshAccessToken } from "../api/auth"

export const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
})

let accessToken: string | null = null

export const setAccessTokenGlobal = (token: string | null) => {
  accessToken = token
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    const data = error?.response?.data

    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/logout")
    ) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { access_token } = await refreshAccessToken()

        setAccessTokenGlobal(access_token)

        processQueue(null, access_token)

        originalRequest.headers.Authorization = `Bearer ${access_token}`

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)

        setAccessTokenGlobal(null)

        toast("Session expired. Please login again.", "error")

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (
      typeof data?.detail === "string" &&
      (data.detail === "Missing refresh token" ||
        data.detail === "Refresh token revoked")
    ) {
      return Promise.reject(error)
    }

    if (Array.isArray(data?.detail)) {
      data.detail.forEach((e: any) => {
        const field = e.loc?.[1]
        toast(field ? `${field}: ${e.msg}` : e.msg, "error")
      })

      // if (error.response?.status === 429){
      //   setTimeout(() => {
      //     window.location.href = "/";
      //   }, 3000);
      // }

      return Promise.reject(error)
    }

    if (typeof data?.detail === "string") {

      toast(data.detail, "error")

      // if (error.response?.status === 429){
      //   setTimeout(() => {
      //     window.location.href = "/";
      //   }, 3000);
      // }
      return Promise.reject(error)
    }

    toast("Something went wrong", "error")
    return Promise.reject(error)
  }
)
