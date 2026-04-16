import { Link, useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { useState } from "react"
import { loginUser } from "../api/auth"
import { useToast } from "../context/ToastContext"
import { useAuth } from "../context/AuthContext"
import { setAccessTokenGlobal } from "../utils/axios"

export default function LoginPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")

  const { setAccessToken } = useAuth()
  const validate = () => {
    if (!identifier.trim()) {
      showToast("Email or username is required", "error")
      return false
    }

    if (!password) {
      showToast("Password is required", "error")
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return

    try {
      const isEmail = identifier.includes("@")

      const payload = isEmail
        ? { email: identifier, password }
        : { username: identifier, password }

      const res = await loginUser(payload)

      setAccessToken(res.access_token)
      setAccessTokenGlobal(res.access_token)

      showToast("Welcome back!", "success")

      navigate("/") 

    } catch (err) {
      showToast(err?.response?.data?.detail || "Login failed", "error")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7fb]">
      <Navbar isFixed={false} />

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="max-w-6xl w-full grid md:grid-cols-2 rounded-3xl overflow-hidden border border-gray-100 shadow-[0px_30px_80px_rgba(0,0,0,0.08)] bg-white">

          <div className="relative bg-[#3f47b2] text-white p-12 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle,_rgba(255,255,255,0.6)_1px,_transparent_1px)] [background-size:18px_18px]" />

            <div className="relative z-10">
              <h2 className="text-xl font-semibold mb-10 opacity-90">
                ShortLink
              </h2>

              <h1 className="text-4xl lg:text-3xl font-extrabold leading-tight mb-6">
                Architecting your digital
                <br />
                traffic flow.
              </h1>

              <p className="text-indigo-100/80 text-base leading-relaxed max-w-sm">
                Access your workspace to monitor, optimize, and scale your brand’s connectivity.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-4 text-xs font-semibold text-white/50 tracking-[0.2em] mt-10">
              <span>ENTERPRISE READY</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>
          </div>

          <div className="p-10 md:p-12 flex flex-col justify-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              Welcome Back
            </h2>

            <p className="text-gray-400 text-sm mb-8">
              Log in to manage your connections.
            </p>

            <div className="space-y-5">

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                  Email or Username
                </label>

                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="mt-2 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition"
                  placeholder="Enter your email or username"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
                  <span>Password</span>
                  <span className="text-indigo-600 cursor-pointer hover:underline normal-case font-medium">
                    Forgot?
                  </span>
                </div>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition"
                  placeholder="••••••••"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold shadow-md hover:shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
              >
                Log In →
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-8">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-indigo-600 font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
