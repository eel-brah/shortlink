import { useState } from "react"
import { updateUrl } from "../../api/urls"
import { useToast } from "../../context/ToastContext"

export default function EditModal({ link, onClose, onUpdated }: any) {
  const [url, setUrl] = useState(link.original_url || "")
  const [alias, setAlias] = useState(link.short_code || "")
  const [active, setActive] = useState(link.is_active ?? true)
  const [expires, setExpires] = useState(
    link.expires_at
      ? new Date(link.expires_at).toISOString().slice(0, 16)
      : ""
  )

  const { showToast } = useToast()

  const handleSave = async () => {
    try {
      const payload: any = {}

      if (url !== link.original_url && url.trim() !== "") {
        payload.original_url = url
      }
      if (alias !== link.short_code && alias.trim() !== "") {
        payload.custom_alias = alias
      }
      if (active !== link.is_active) payload.is_active = active
      if (expires !== "") payload.expires_at = expires ? new Date(expires).toISOString() : null
      if (expires === "") payload.expires_at = null

      const updated = await updateUrl(link.short_code, payload)

      showToast("Link updated", "success")
      onUpdated(updated, link.short_code)
      onClose()
    } catch (e) {
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl">

        <h2 className="text-xl font-bold mb-6">Edit Link</h2>

        <div className="space-y-4">

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">
              Original URL
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 w-full bg-gray-100 rounded-xl px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">
              Custom Alias
            </label>
            <input
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="mt-1 w-full bg-gray-100 rounded-xl px-4 py-3 outline-none"
            />
          </div>

          <div className="flex items-center justify-between bg-gray-100 rounded-xl px-4 py-3">
            <span className="text-sm font-medium">Active</span>

            <button
              onClick={() => setActive(!active)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition ${active ? "bg-green-500" : "bg-gray-300"
                }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow transform transition ${active ? "translate-x-6" : ""
                  }`}
              />
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">
              Expiration Date
            </label>
            <input
              type="datetime-local"
              value={expires}
              onChange={(e) => setExpires(e.target.value)}
              className="mt-1 w-full bg-gray-100 rounded-xl px-4 py-3 outline-none"
            />

            <button
              onClick={() => setExpires("")}
              className="text-xs text-red-400 mt-1"
            >
              Clear expiration
            </button>
          </div>

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
          >
            Save
          </button>

        </div>

      </div>
    </div>
  )
}
