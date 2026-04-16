import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import Footer from "./Footer"
import { getMyUrls, deleteUrl } from "../api/urls"
import EditModal from "../components/dashboard/EditModal"

import {
  Link2,
  Search,
  Pencil,
  Trash2,
  Copy,
  MousePointerClick,
} from "lucide-react"

import {
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts"
import { BASE_URL, DOMAIN } from "../utils/config"
import { useNavigate } from "react-router-dom"
import { getGlobalAnalytics } from "../api/analytics"

export default function DashboardPage() {
  const [links, setLinks] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalClicks, setTotalClicks] = useState(0)
  const [search, setSearch] = useState("")
  const [editing, setEditing] = useState<any>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all")
  const [sort, setSort] = useState<"newest" | "oldest" | "clicks">("newest")
  const [, forceUpdate] = useState(0)
  const [chartData, setChartData] = useState<any[]>([])

  const navigate = useNavigate()
  useEffect(() => {
    load()
    loadAnalytics()
  }, [page])

  const loadAnalytics = async () => {
    try {
      const data = await getGlobalAnalytics()

      const formatted = data.map((d: any) => ({
        name: new Date(d.date).toLocaleDateString(undefined, {
          day: "2-digit",
        }),
        clicks: d.clicks,
      }))

      setChartData(formatted)
    } catch {
    }
  }
  const load = async () => {
    setLoading(true)
    try {
      const res = await getMyUrls(page, size)
      setLinks(res.items)
      setTotal(res.total)
      setTotalClicks(res.total_clicks)
      setLoading(false)
    }
    catch {
    }
  }

  const totalPages = Math.ceil(total / size)

  const handleDelete = async (code: string) => {
    try {
      await deleteUrl(code)
      load()
    } catch { }
  }

  const handleUpdate = (updated: any, oldCode: string) => {
    setLinks((prev) =>
      prev.map((l) =>
        l.short_code === oldCode ? updated : l
      )
    )
    setEditing(null)
  }


  const copy = (text: string) => navigator.clipboard.writeText(text)

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate((n) => n + 1)
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const timeAgo = (dateStr?: string) => {
    if (!dateStr) return "-"
    const date = new Date(dateStr)
    const diff = Math.floor((Date.now() - date.getTime()) / 1000)

    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`

    return `${Math.floor(diff / 2592000)}mo ago`
  }


  const processed = links
    .filter((l) => {
      if (filter === "active") {
        return l.is_active !== false && !l.expires_at
      }
      if (filter === "expired") {
        return l.expires_at && new Date(l.expires_at) < new Date()
      }
      return true
    })
    .filter((l) =>
      l.short_code.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sort === "clicks") return (b.click_count || 0) - (a.click_count || 0)
      if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20">
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 py-10">

          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
              My Links
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage and monitor your links
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">

            <div className="bg-white/80 backdrop-blur border border-gray-200/70 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex justify-between">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Link2 size={16} className="text-indigo-500" />
                  Total Links
                </p>
                <h2 className="text-3xl font-semibold mt-2">{total}</h2>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Link2 className="text-indigo-600" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur border border-gray-200/70 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex justify-between">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <MousePointerClick size={16} className="text-indigo-500" />
                  Total Clicks
                </p>
                <h2 className="text-3xl font-semibold mt-2">{totalClicks}</h2>
                <span className="text-xs text-indigo-600">Real-time</span>
              </div>

              <div className="w-36 h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <Bar dataKey="clicks" radius={[8, 8, 0, 0]} fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          <div className="bg-white/70 backdrop-blur border border-gray-200/60 rounded-2xl px-4 py-3 shadow-sm mb-6 flex justify-between items-center">

            <div className="relative w-72">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search links..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="flex items-center gap-3">

              <div className="flex bg-gray-100 rounded-xl p-1">
                {["all", "active", "expired"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-3 py-1 text-sm rounded-lg capitalize transition ${filter === f ? "bg-white shadow font-medium" : "text-gray-500"
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="bg-gray-100 px-3 py-2 rounded-xl text-sm"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="clicks">Most Clicks</option>
              </select>

            </div>
          </div>

          <div className="bg-white/90 backdrop-blur border border-gray-200/60 rounded-2xl overflow-hidden">

            <div className="grid grid-cols-[3fr_4fr_1fr_1fr_1fr_1fr] px-6 py-4 items-center text-xs font-semibold text-gray-400 uppercase border-b border-gray-100">

              <div>Short Link</div>
              <div>Original URL</div>
              <div className="text-center">Clicks</div>
              <div className="text-center">Created</div>
              <div className="text-center">Status</div>
              <div className="text-right">Actions</div>
            </div>

            <div className="divide-y divide-gray-100">

              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 animate-pulse flex justify-between">
                    <div className="w-40 h-3 bg-gray-200 rounded" />
                    <div className="w-32 h-3 bg-gray-200 rounded" />
                    <div className="w-12 h-3 bg-gray-200 rounded" />
                    <div className="w-20 h-3 bg-gray-200 rounded" />
                    <div className="w-16 h-3 bg-gray-200 rounded" />
                  </div>
                ))}

              {!loading && processed.length === 0 && (
                <div className="py-16 text-center text-gray-500">
                  No links found
                </div>
              )}

              {!loading &&
                processed.map((l) => {
                  const expired =
                    l.expires_at && new Date(l.expires_at) < new Date()

                  return (
                    <div
                      key={l.short_code}
                      className="grid grid-cols-[3fr_4fr_1fr_1fr_1fr_1fr] px-6 py-4 items-center hover:bg-gray-50 transition group"
                    >

                      <div className="flex items-center gap-3 min-w-0">

                        <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                          <Link2 size={14} className="text-indigo-600" />
                        </div>

                        <div className="min-w-0">
                          <div
                            className="font-semibold text-gray-900 flex items-center gap-2 truncate cursor-pointer hover:text-indigo-600"
                            onClick={() => navigate(`/dashboard/${l.short_code}`)}
                          >
                            {DOMAIN}/{l.short_code}

                            <Copy
                              size={14}
                              className="opacity-0 group-hover:opacity-100 cursor-pointer text-gray-400 hover:text-indigo-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                copy(`${BASE_URL}/${l.short_code}`)
                              }}
                            />
                          </div>

                          <div className="text-xs text-gray-400">
                            Created {timeAgo(l.created_at)}
                          </div>
                        </div>

                      </div>

                      <div className="text-sm text-gray-500 truncate pr-4">
                        {l.original_url}
                      </div>

                      <div className="text-center">
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {l.click_count || 0}
                        </span>
                      </div>

                      <div className="text-sm text-gray-500 text-center">
                        {new Date(l.created_at).toLocaleDateString()}
                      </div>

                      <div className="text-center">
                        {expired ? (
                          <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
                            Expired
                          </span>
                        ) : l.is_active === false ? (
                          <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                            Disabled
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                            Active
                          </span>
                        )}
                      </div>

                      <div className="flex justify-end gap-3">
                        <Pencil
                          size={16}
                          className="cursor-pointer text-gray-400 hover:text-indigo-600"
                          onClick={() => setEditing(l)}
                        />
                        <Trash2
                          size={16}
                          className="cursor-pointer text-gray-400 hover:text-red-500"
                          onClick={() => setConfirmDelete(l.short_code)}
                        />
                      </div>

                    </div>
                  )
                })}
            </div>

            <div className="flex justify-between items-center px-6 py-4 text-sm text-gray-500 border-t border-gray-100">

              <span>
                Showing {(page - 1) * size + 1}–
                {Math.min(page * size, total)} of {total} links
              </span>

              <div className="flex items-center gap-2">

                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30"
                >
                  ←
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 rounded ${page === i + 1
                      ? "bg-indigo-600 text-white"
                      : "hover:bg-gray-100"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30"
                >
                  →
                </button>

              </div>

            </div>
          </div>

        </div>

        {editing && (
          <EditModal
            link={editing}
            onClose={() => setEditing(null)}
            onUpdated={handleUpdate}
          />
        )}

        {confirmDelete && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

            <div className="bg-white rounded-2xl p-6 w-[400px] shadow-xl">

              <h3 className="text-lg font-semibold mb-2">
                Delete link?
              </h3>

              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    await handleDelete(confirmDelete)
                    setConfirmDelete(null)
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600"
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
