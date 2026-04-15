import { Routes, Route } from "react-router-dom"

import LandingPage from "./components/LandingPage"
import PricingPage from "./components/PricingPage"
import LoginPage from "./components/LoginPage"
import RegisterPage from "./components/RegisterPage"
import ScrollToTop from "./components/ScrollToTop"
import { useAuth } from "./context/AuthContext"
import { useEffect } from "react"
import { setAccessTokenGlobal } from "./utils/axios"
import { refreshAccessToken } from "./api/auth"
import { PublicOnly, RequireAuth } from "./components/RequireAuth"
import DashboardPage from "./components/DashboardPage"
import LinkAnalyticsPage from "./components/LinkAnalyticsPage"

function App() {
  const { setAccessToken, setLoading } = useAuth()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await refreshAccessToken()

        setAccessToken(res.access_token)
        setAccessTokenGlobal(res.access_token)
      } catch {
        setAccessToken(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])
  return (

    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />

        <Route path="/login"
          element={
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          } />
        <Route path="/register" element={
          <PublicOnly>
            <RegisterPage />
          </PublicOnly>} />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route path="/dashboard/:code" element={
          <RequireAuth>
            <LinkAnalyticsPage />
          </RequireAuth>
        } />
      </Routes>
    </>
  )
}

export default App
