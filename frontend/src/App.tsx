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

function App() {
  const { setAccessToken } = useAuth()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await refreshAccessToken()

        setAccessToken(res.access_token)
        setAccessTokenGlobal(res.access_token)

      } catch {
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  )
}

export default App
