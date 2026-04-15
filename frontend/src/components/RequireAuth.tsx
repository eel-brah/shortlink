import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import type { JSX } from "react"

export function RequireAuth({ children }: any) {
  const { accessToken, loading } = useAuth()

  if (loading) return null

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  return children
}

export function PublicOnly({ children }: { children: JSX.Element }) {
  const { accessToken } = useAuth()

  if (accessToken) {
    return <Navigate to="/" replace />
  }

  return children
}
