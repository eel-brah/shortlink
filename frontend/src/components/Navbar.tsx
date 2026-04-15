import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { setAccessTokenGlobal } from "../utils/axios"
import { logoutUser } from "../api/auth"

interface NavbarProps {
  isFixed?: boolean
}

export default function Navbar({ isFixed = true }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { accessToken, setAccessToken } = useAuth()
  const { showToast } = useToast()

  const positionClass = isFixed ? "fixed top-0" : "relative"

  const navLink = (path: string, label: string) => {
    const active = location.pathname === path
    return (
      <Link
        to={path}
        className={`text-sm font-semibold transition relative ${active ? "text-indigo-700" : "text-gray-500 hover:text-indigo-600"
          }`}
      >
        {label}
        {active && (
          <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-indigo-600 rounded" />
        )}
      </Link>
    )
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch {
    }

    setAccessToken(null)
    setAccessTokenGlobal(null)

    showToast("Logged out", "info")
    navigate("/login")
  }

  return (
    <nav
      className={`${positionClass} w-full z-50 bg-white/70 backdrop-blur-lg border-b border-gray-100 flex justify-between items-center px-8 py-4`}
    >
      <div className="text-2xl font-extrabold text-indigo-900 tracking-tight">
        ShortLink
      </div>

      <div className="hidden md:flex gap-8 items-center">
        {navLink("/", "Features")}
        {navLink("/pricing", "Pricing")}
        {accessToken && navLink("/dashboard", "Dashboard")}
      </div>

      <div className="flex items-center gap-3">

        {!accessToken ? (
          <>
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-600 hover:text-red-500 px-3 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </>
        )}

      </div>
    </nav>
  )
}
