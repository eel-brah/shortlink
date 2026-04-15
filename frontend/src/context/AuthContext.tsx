import { createContext, useContext, useState } from "react"

type AuthContextType = {
  accessToken: string | null
  setAccessToken: (token: string | null) => void
  loading: boolean
  setLoading: (v: boolean) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("AuthProvider missing")
  return ctx
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
