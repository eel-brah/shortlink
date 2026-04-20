import { Link } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Insights } from "@mui/icons-material"
import { useState } from "react"
import { useToast } from "../context/ToastContext"
import { registerUser } from "../api/auth"

export default function RegisterPage() {

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const { showToast } = useToast()

  const validate = () => {
    if (!username.trim()) {
      showToast("Username is required", "error")
      return false
    }

    if (username.length < 3 || username.length > 20) {
      showToast("Username must be between 3 and 20 characters", "error")
      return false
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      showToast("Username can only contain letters, numbers, and underscores", "error")
      return false
    }

    if (!email.trim()) {
      showToast("Email is required", "error")
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address", "error")
      return false
    }

    if (!password) {
      showToast("Password cannot be empty", "error")
      return false
    }

    if (password.length < 12) {
      showToast("Password must be at least 12 characters or use a passphrase with at least 5 words", "error")
      return false
    }

    if (password.length > 128) {
      showToast("Password is too long", "error")
      return false
    }

    return true
  }


  const handleSubmit = async (e: any) => {
    if (e) e.preventDefault();

    if (!validate()) return

    try {
      const data = {
        username,
        email,
        password,
      }

      await registerUser(data)

      const raw = localStorage.getItem("pending_link_code");
      let pendingCode: string | null = null;
      if (raw) {
        try {
          const data = JSON.parse(raw);
          if (Date.now() < data.expiresAt) {
            pendingCode = data.value;
          } else {
            localStorage.removeItem("pending_link_code");
          }
        } catch { }
      }

      if (pendingCode) {
        showToast("Login to claim your link", "success");
      } else {
        showToast("Account created successfully", "success");
      }

      setTimeout(() => {
        window.location.href = "/login"
      }, 1800)

    } catch {
    }
  }

  return (
    <div className="min-h-screen md:h-screen flex flex-col bg-[#f6f7fb] md:overflow-hidden">

      <Navbar isFixed={false} />

      <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-0 md:px-6">

        <div className="max-w-5xl w-full h-auto md:h-[min(800px,85%)] grid md:grid-cols-2 rounded-3xl overflow-hidden border border-gray-100 shadow-[0px_20px_50px_rgba(0,0,0,0.06)] bg-white">

          <div className="relative bg-[#3f47b2] text-white p-10 lg:p-16 hidden md:flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <div className="w-[140%] h-[140%] border border-white/20 rounded-full absolute" />
              <div className="w-[90%] h-[90%] border border-white/30 rounded-full absolute" />
              <div className="w-[55%] h-[55%] border border-white/20 rounded-full absolute" />
            </div>

            <div className="relative z-10">
              <h2 className="text-xl font-semibold mb-10 opacity-90">ShortLink</h2>
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-8">
                Architecting the flow of digital traffic.
              </h1>
              <p className="text-indigo-100/70 text-base leading-relaxed max-w-sm">
                Join the platform that turns every click into a data-driven insight.
              </p>
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex items-center gap-4 w-fit">
              <div className="w-10 h-10 rounded-full bg-indigo-400/30 flex items-center justify-center">
                <Insights className="text-white text-sm" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-[0.2em] text-white/50">LIVE PULSE</p>
                <p className="text-sm font-bold">1.2M+ links architected</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-10 md:px-12 flex flex-col justify-center bg-white">
            <h2 className="text-2xl font-bold mb-1">Create your account</h2>
            <p className="text-gray-400 text-sm mb-6">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 font-semibold">Log In</Link>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="mt-1.5 w-full h-[44px] rounded-xl px-4 text-sm outline-none transition 
                  bg-gray-100 border border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">Email Address</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="mt-1.5 w-full h-[44px] rounded-xl px-4 text-sm outline-none transition 
                  bg-gray-100 border border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-600">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 w-full h-[44px] rounded-xl px-4 text-sm outline-none transition 
                  bg-gray-100 border border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/30"
                />
                <p className="text-[11px] text-gray-400 mt-1">Minimum 12 characters</p>
              </div>

              <button
                type="submit" // Changed to type="submit"
                className="w-full mt-2 h-[46px] rounded-xl font-semibold text-white
                bg-gradient-to-r from-indigo-600 to-indigo-500
                shadow-md hover:shadow-lg hover:scale-[0.99] active:scale-95 transition-all"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
