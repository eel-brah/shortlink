import { useState, useEffect } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { updateProfile, deleteProfile, getMe, deleteAvatar, uploadAvatar } from "../api/user"
import { useToast } from "../context/ToastContext"
import { useAuth } from "../context/AuthContext"
import { User, Shield, AlertTriangle } from "lucide-react"
import { getImageUrl } from "../utils/urls"
import { setAccessTokenGlobal } from "../utils/axios"
import { useNavigate } from "react-router-dom"

export default function ProfilePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { setAccessToken } = useAuth()

  const [initialUser, setInitialUser] = useState<any>(null)

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState<string | null>(null)

  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")

  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const user = await getMe()
        setInitialUser(user)
        setUsername(user.username)
        setEmail(user.email)
        setAvatar(user.avatar_url || null) 
        console.log(user.avatar_url)
      } catch { }
    }
    load()
  }, [])

  const handleProfileUpdate = async () => {
    try {
      const payload: any = {}

      if (username !== initialUser.username) {
        payload.username = username
      }

      if (email !== initialUser.email) {
        payload.email = email
      }

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

    const res = await uploadAvatar(file)
    setAvatar(res.avatar_url)
  }

  const handleAvatarRemove = async () => {
    await deleteAvatar()
    setAvatar(null)
  }

  return (
    <>
      <div className="min-h-screen bg-[#f6f7fb] pt-20">
        <Navbar />

        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

          <div className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm">

            <div className="w-14 h-14 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
              {avatar ? (
                <img src={getImageUrl(avatar)} className="w-full h-full object-cover" />
              ) : (
                <User className="text-indigo-600" />
              )}
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">{username}</h2>

              <p className="text-sm text-gray-500">
                Update your photo and personal details.
              </p>

              <div className="flex gap-4 mt-2 text-sm">
                <label className="text-indigo-600 font-medium cursor-pointer">
                  Upload New
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>

                <button
                  onClick={handleAvatarRemove}
                  className="text-red-500 font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <User size={16} />
              Profile Information
            </div>

            <div className="bg-white rounded-2xl p-6 grid grid-cols-2 gap-4 shadow-sm">

              <div>
                <label className="text-xs text-gray-400">
                  Username (required)
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 w-full bg-gray-50 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400">
                  Email Address
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full bg-gray-50 rounded-xl px-4 py-3"
                />
              </div>

              <div className="col-span-2 flex ">
                <button
                  onClick={handleProfileUpdate}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-indigo-700"
                >
                  Update Info
                </button>
              </div>

            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <Shield size={16} />
              Security
            </div>

            <div className="bg-white rounded-2xl p-6 space-y-4 shadow-sm">

              <div>
                <label className="text-xs text-gray-400">
                  Current Password
                </label>
                <input
                  type="password"
                  value={password}
                  placeholder="************"
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full bg-gray-50 rounded-xl px-4 py-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="text-xs text-gray-400">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 12 chars"
                    className="mt-1 w-full bg-gray-50 rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-400">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    placeholder="At least 12 chars"
                    className="mt-1 w-full bg-gray-50 rounded-xl px-4 py-3"
                  />
                </div>

              </div>

              <button
                onClick={handlePasswordUpdate}
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-indigo-700"
              >
                Update Password
              </button>

            </div>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 space-y-3">

            <div className="flex items-center gap-2 text-red-600 font-semibold">
              <AlertTriangle size={16} />
              Danger Zone
            </div>

            <p className="text-sm text-red-500">
              Deleting your account is permanent and cannot be undone.
            </p>

            <button
              onClick={() => setConfirmDelete(true)}
              className="bg-red-600 text-white px-5 py-2 rounded-xl font-semibold"
            >
              Delete My Account
            </button>

          </div>

        </div>

        {confirmDelete && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-[400px]">
              <h3 className="text-lg font-semibold mb-2">
                Confirm deletion
              </h3>

              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-gray-500"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Delete
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
