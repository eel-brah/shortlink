import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { setAccessTokenGlobal } from "../utils/axios"
import { logoutUser } from "../api/auth"

import { useState, useEffect, useRef } from "react"
import { User, LogOut, LayoutDashboard, Home, Tag } from "lucide-react"
import { getMe } from "../api/user"
import { getImageUrl } from "../utils/urls"

interface NavbarProps {
  isFixed?: boolean
}

export default function Navbar({ isFixed = true }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { accessToken, setAccessToken } = useAuth()

  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (!accessToken) return
    getMe().then(setUser).catch(() => { })
  }, [accessToken])

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
    } catch { }

    setAccessTokenGlobal(null)
    setAccessToken(null)

    showToast("Logged out", "info")
    navigate("/login")
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <nav className={`${positionClass} w-full z-50 bg-white/70 backdrop-blur-lg border-b border-gray-100 flex justify-between items-center px-8 py-4`}>
      <button onClick={() => {
        navigate("/");
      }}
        className="text-2xl font-extrabold text-indigo-900 tracking-tight">ShortLink</button>

      <div className="hidden md:flex gap-8 items-center">
        {navLink("/", "Home")}
        {navLink("/pricing", "Pricing")}
        {accessToken && navLink("/dashboard", "Dashboard")}
      </div>

      <div className="flex items-center gap-3 relative">
        {!accessToken ? (
          <>
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600 px-3 py-2 transition">
              Login
            </Link>
            <Link to="/register" className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">
              Sign Up
            </Link>
          </>
        ) : (
          <div ref={dropdownRef} className="relative">

            <button
              onClick={() => setOpen((p) => !p)}
              className={`group flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${open ? "ring-4 ring-indigo-50 bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                }`}
            >
              <User size={18} className={`${open ? "scale-110" : "scale-100"} transition-transform`} />
            </button>

            <div
              className={`absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden transform transition-all duration-300 ease-out origin-top-right
              ${open ? "translate-y-0 opacity-100 scale-100" : "-translate-y-2 opacity-0 scale-95 pointer-events-none"}`}
            >
              <div className="relative px-5 py-5 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />

                <div className="relative flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-indigo-100 border border-slate-200/60 flex items-center justify-center">
                      {user?.avatar_url ? (
                        <img
                          src={getImageUrl(user.avatar_url)}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-violet-500 text-white">
                          {user?.username?.[0]?.toUpperCase() || <User size={20} />}
                        </div>
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-slate-900 truncate leading-tight">
                        {user?.username || "User"}
                      </span>

                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-[10px] font-bold text-indigo-600 uppercase tracking-tight border border-indigo-100/50 shadow-sm shadow-indigo-100/20">
                        Free
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/pricing");
                          setOpen(false);
                        }}
                        className="px-1.5 py-0.5 rounded-md bg-amber-50 text-[10px] font-bold text-amber-600 uppercase tracking-tight border border-amber-200 hover:bg-amber-100 transition-colors shadow-sm shadow-amber-100/50"
                      >
                        Upgrade
                      </button>
                    </div>

                    <span className="text-[12px] text-slate-500 truncate font-medium mt-0.5">
                      {user?.email || "No email linked"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

              <div className="p-2">
                <div className="md:hidden">
                  <button
                    onClick={() => { navigate("/"); setOpen(false); }}
                    className="group flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-all"
                  >
                    <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-white transition-colors">
                      <Home size={14} />
                    </div>
                    Home
                  </button>
                  <button
                    onClick={() => { navigate("/pricing"); setOpen(false); }}
                    className="group flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-all"
                  >
                    <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-white transition-colors">
                      <Tag size={14} />
                    </div>
                    Pricing
                  </button>
                  <div className="my-2 border-t border-gray-50" />
                </div>

                <button
                  onClick={() => { navigate("/dashboard"); setOpen(false); }}
                  className="group flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-all"
                >
                  <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-white transition-colors">
                    <LayoutDashboard size={14} />
                  </div>
                  Dashboard
                </button>

                <button
                  onClick={() => { navigate("/profile"); setOpen(false); }}
                  className="group flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-all"
                >
                  <div className="p-1.5 rounded-lg bg-gray-50 group-hover:bg-white transition-colors">
                    <User size={14} />
                  </div>
                  My Profile
                </button>

                <div className="my-2 border-t border-gray-50" />

                <button
                  onClick={handleLogout}
                  className="group flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 transition-all"
                >
                  <div className="p-1.5 rounded-lg bg-red-100/50 group-hover:bg-white  transition-colors">
                    <LogOut size={14} />
                  </div>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
