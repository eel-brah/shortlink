import { useState, useEffect } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { updateProfile, deleteProfile, getMe, deleteAvatar, uploadAvatar } from "../api/user"
import { useToast } from "../context/ToastContext"
import { useAuth } from "../context/AuthContext"
import { User, Shield, AlertTriangle, Sparkles, Calendar, CheckCircle } from "lucide-react"
import { getImageUrl } from "../utils/urls"
import { setAccessTokenGlobal } from "../utils/axios"
import { useNavigate } from "react-router-dom"
import { getMyUrls } from "../api/urls"

export default function ProfilePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { setAccessToken } = useAuth()

  const [initialUser, setInitialUser] = useState<any>(null)

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState<string | null>(null)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)

  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmUpdate, setConfirmUpdate] = useState<null | "profile" | "password">(null)

  const [linksUsed, setLinksUsed] = useState(0);
  const linkLimit = 300;

  useEffect(() => {
    const load = async () => {
      try {
        const user = await getMe()
        setInitialUser(user)
        setUsername(user.username)
        setEmail(user.email)
        setAvatar(user.avatar_url || null)
        const urls = await getMyUrls(1, 1)
        setLinksUsed(urls.total)
      } catch {
      }
    }
    load()
  }, [])

  const handleProfileUpdate = async () => {
    try {
      const payload: any = {}
      if (username !== initialUser.username) payload.username = username
      if (email !== initialUser.email) payload.email = email

      if (Object.keys(payload).length === 0) {
        showToast("No changes made", "info")
        return
      }

      await updateProfile(payload)
      showToast("Profile updated", "success")
    } catch { }
  }

  const handlePasswordUpdate = async () => {
    try {
      await updateProfile({
        password,
        new_password: newPassword,
        new_password_repeat: repeatPassword,
      })
      showToast("Password updated", "success")
    } catch { }
  }

  const handleDelete = async () => {
    await deleteProfile()
    setAccessToken(null)
    setAccessTokenGlobal(null)
    navigate("/login")
  }

  const handleAvatarUpload = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Optimistic Preview
    const reader = new FileReader()
    reader.onload = (e) => setPreviewAvatar(e.target?.result as string)
    reader.readAsDataURL(file)

    try {
      const res = await uploadAvatar(file)
      setAvatar(res.avatar_url)
      setPreviewAvatar(null)
      showToast("Avatar updated", "success")
    } catch {
      setPreviewAvatar(null)
    }
  }

  const handleAvatarRemove = async () => {
    await deleteAvatar()
    setAvatar(null)
    setPreviewAvatar(null)
  }

  const getProfileChanges = () => {
    if (!initialUser) return []
    const changes: string[] = []
    if (username !== initialUser.username) changes.push(`Username: ${initialUser.username} → ${username}`)
    if (email !== initialUser.email) changes.push(`Email: ${initialUser.email} → ${email}`)
    return changes
  }

  const getPasswordIssues = () => {
    const issues: string[] = []
    if (!password) issues.push("Current password is required")
    if (!newPassword) issues.push("New password is required")
    if (newPassword && newPassword.length < 12) issues.push("New password must be at least 12 characters")
    if (newPassword !== repeatPassword) issues.push("Passwords do not match")
    return issues
  }

  const hasValidPasswordChange = getPasswordIssues().length === 0
  const hasChanges = getProfileChanges().length > 0

  return (
    <>
      <div className="min-h-screen bg-[#f6f7fb] pt-20 overflow-x-hidden">
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-8 space-y-8">

            <div className="bg-white rounded-2xl p-6 flex flex-row items-center gap-4 md:gap-6 shadow-sm border border-gray-100">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-indigo-50 border-4 border-white shadow-md flex items-center justify-center shrink-0">
                {previewAvatar || avatar ? (
                  <img src={previewAvatar || getImageUrl(avatar!)} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <User size={40} className="text-indigo-200" />
                )}
              </div>

              <div className="text-left">
                <h2 className="font-bold text-gray-900 text-lg">{username || "User"}</h2>
                <p className="text-sm text-gray-500">Update your photo and personal details.</p>
                <div className="flex justify-start gap-6 mt-3 text-sm">
                  <label className="text-indigo-600 font-bold cursor-pointer hover:text-indigo-700 transition-colors">
                    Upload New
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </label>
                  <button onClick={handleAvatarRemove} className="text-red-500 font-bold hover:text-red-600 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-gray-50/50 p-3 rounded-t-2xl border-x border-t border-gray-100 font-bold text-gray-700 text-sm">
                <User size={18} className="text-indigo-500" />
                Profile Information
              </div>
              <div className="bg-white rounded-b-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 shadow-sm border border-gray-100 mt-[-1rem]">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
                <div className="md:col-span-2 pt-2">
                  <button
                    onClick={() => {
                      if (!hasChanges) { showToast("No changes to update", "info"); return; }
                      setConfirmUpdate("profile")
                    }}
                    className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-gray-50/50 p-3 rounded-t-2xl border-x border-t border-gray-100 font-bold text-gray-700 text-sm">
                <Shield size={18} className="text-indigo-500" />
                Security
              </div>
              <div className="bg-white rounded-b-2xl p-5 md:p-8 space-y-6 shadow-sm border border-gray-100 mt-[-1rem]">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Current Password</label>
                  <input
                    type="password"
                    value={password}
                    placeholder="••••••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 12 characters"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setConfirmUpdate("password")}
                    className="w-full md:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">

            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={80} /></div>
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                  <Sparkles size={20} />
                </div>
                <span className="text-[10px] font-black bg-white text-indigo-600 px-2 py-1 rounded-md uppercase">Free Plan</span>
              </div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1 relative z-10">Current Usage</p>
              <h3 className="text-2xl font-black mb-4 relative z-10">Unlimited Clicks</h3>

              <div className="space-y-3 mb-6 relative z-10">
                <div className="flex justify-between text-xs">
                  <span>Links Used</span>
                  <span className="font-bold">{linksUsed} / {linkLimit}</span>
                </div>
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-1000"
                    style={{ width: `${Math.min((linksUsed / linkLimit) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <button onClick={() => navigate('/pricing')} className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors relative z-10">
                Upgrade to Pro
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-5">Account Details</h4>
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Member Since</p>
                    <p className="text-sm font-bold text-gray-700">{initialUser ? new Date(initialUser.created_at).toLocaleDateString() : '...'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <CheckCircle size={18} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Account Status</p>
                    <p className="text-sm font-bold text-green-600 uppercase tracking-tighter">Verified & Active</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-red-600 font-bold mb-2">
                <AlertTriangle size={18} />
                <span className="text-xs uppercase tracking-widest">Danger Zone</span>
              </div>
              <p className="text-[11px] text-red-500/80 leading-relaxed mb-4">
                Deleting your account is permanent. All links and analytics will be wiped.
              </p>
              <button onClick={() => setConfirmDelete(true)} className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 text-[10px] font-bold hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest">
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {(confirmDelete || confirmUpdate) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
            <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom md:zoom-in duration-300">
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6 md:hidden" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {confirmDelete ? "Confirm Deletion" : "Confirm Update"}
              </h3>
              <div className="mb-8 text-sm text-gray-600 space-y-3 leading-relaxed">
                {confirmDelete ? (
                  <p>Are you absolutely sure? This action is **permanent** and all your links will stop working.</p>
                ) : (
                  <div>
                    {confirmUpdate === "profile" ? (
                      hasChanges ? (
                        <>
                          <p className="font-bold text-gray-800">Review your changes:</p>
                          <ul className="list-disc ml-5 mt-2 space-y-1">
                            {getProfileChanges().map((change, i) => <li key={i}>{change}</li>)}
                          </ul>
                        </>
                      ) : <p>No changes detected.</p>
                    ) : (
                      hasValidPasswordChange ? <p>You are about to securely update your password.</p> : <p className="text-red-500 font-bold">Please check your password requirements.</p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col md:flex-row justify-end gap-3">
                <button onClick={() => { setConfirmDelete(false); setConfirmUpdate(null); }} className="w-full md:w-auto order-2 md:order-1 px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                <button
                  onClick={async () => {
                    if (confirmDelete) await handleDelete();
                    else if (confirmUpdate === "profile") await handleProfileUpdate();
                    else await handlePasswordUpdate();
                    setConfirmDelete(false); setConfirmUpdate(null);
                  }}
                  disabled={(confirmUpdate === "profile" && !hasChanges) || (confirmUpdate === "password" && !hasValidPasswordChange)}
                  className={`w-full md:w-auto order-1 md:order-2 px-8 py-3 rounded-xl text-sm font-bold text-white transition-all 
                    ${confirmDelete ? "bg-red-600 hover:bg-red-700" : "bg-indigo-600 hover:bg-indigo-700"} 
                    disabled:bg-gray-300 disabled:cursor-not-allowed`}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
