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
  ChevronLeft,
  ChevronRight,
  PlusCircle,
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
    } catch { }
  }

  const load = async () => {
    setLoading(true)
    try {
      const res = await getMyUrls(page, size)
      setLinks(res.items)
      setTotal(res.total)
      setTotalClicks(res.total_clicks)
      setLoading(false)
    } catch { }
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

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-20 pb-10">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
          <div className="mb-8 md:mb-10 flex justify-between items-end">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
                My Links
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage and monitor your links
              </p>
            </div>

            <button
              onClick={() => navigate("/")}
              className="group flex items-center gap-2 bg-white/40 backdrop-blur-md border border-white shadow-sm px-5 py-2.5 rounded-2xl text-xs font-bold text-indigo-600 hover:bg-white hover:shadow-md transition-all active:scale-95"
            >
              <div className="bg-indigo-100 p-1 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <PlusCircle size={16} />
              </div>
              <span className="tracking-wide uppercase">New Link</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10">
            <div className="bg-white/80 backdrop-blur border border-gray-200/70 rounded-2xl p-6 shadow-sm flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Link2 size={16} className="text-indigo-500" />
                  Total Links
                </p>
                <h2 className="text-3xl font-semibold mt-1">{total}</h2>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                <Link2 className="text-indigo-600" />
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur border border-gray-200/70 rounded-2xl p-6 shadow-sm flex justify-between items-center">
              <div className="min-w-0">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <MousePointerClick size={16} className="text-indigo-500" />
                  Total Clicks
                </p>
                <h2 className="text-3xl font-semibold mt-1">{totalClicks}</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Real-time</span>
              </div>
              <div className="w-24 md:w-36 h-16 md:h-20 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <Bar dataKey="clicks" radius={[4, 4, 0, 0]} fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur border border-gray-200/60 rounded-2xl px-4 py-3 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search links..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="flex bg-gray-100 rounded-xl p-1 w-full sm:w-auto overflow-x-auto">
                {["all", "active", "expired"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`flex-1 sm:flex-none px-3 py-1.5 text-xs md:text-sm rounded-lg capitalize transition whitespace-nowrap ${filter === f ? "bg-white shadow font-medium" : "text-gray-500"
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="w-full sm:w-auto bg-gray-100 px-3 py-2 rounded-xl text-sm outline-none border-r-8 border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="clicks">Most Clicks</option>
              </select>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm">
            <div className="hidden md:grid grid-cols-[3fr_4fr_1fr_1fr_1fr_1fr] px-6 py-4 items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
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
                  <div key={i} className="px-6 py-8 animate-pulse flex justify-between items-center">
                    <div className="w-1/3 h-4 bg-gray-100 rounded" />
                    <div className="w-1/4 h-4 bg-gray-100 rounded hidden md:block" />
                    <div className="w-12 h-8 bg-gray-100 rounded-full" />
                  </div>
                ))}

              {!loading && processed.length === 0 && (
                <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-2">
                  <Search size={40} className="text-gray-200" />
                  <p className="font-medium">No links found</p>
                </div>
              )}

              {!loading &&
                processed.map((l) => {
                  const expired = l.expires_at && new Date(l.expires_at) < new Date()

                  return (
                    <div
                      key={l.short_code}
                      className="group flex flex-col md:grid md:grid-cols-[3fr_4fr_1fr_1fr_1fr_1fr] px-4 md:px-6 py-4 md:items-center hover:bg-gray-50/50 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0 mb-3 md:mb-0">
                        <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                          <Link2 size={14} className="text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <div
                            className="font-bold text-gray-900 flex items-center gap-2 truncate cursor-pointer hover:text-indigo-600 transition-colors"
                            onClick={() => navigate(`/dashboard/${l.short_code}`)}
                          >
                            <span className="truncate">{DOMAIN}/{l.short_code}</span>
                            <Copy
                              size={12}
                              className="shrink-0 opacity-0 group-hover:opacity-100 cursor-pointer text-gray-400 hover:text-indigo-600 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                copy(`${BASE_URL}/${l.short_code}`)
                              }}
                            />
                          </div>
                          <div className="text-[10px] text-gray-400 font-medium">
                            {timeAgo(l.created_at)}
                          </div>
                        </div>
                        <div className="ml-auto md:hidden">
                          {expired ? (
                            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold">Expired</span>
                          ) : l.is_active === false ? (
                            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold">Disabled</span>
                          ) : (
                            <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">Active</span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 truncate mb-4 md:mb-0 pr-0 md:pr-4 pl-12 md:pl-0">
                        <span className="md:hidden block text-[10px] font-bold text-gray-300 uppercase mb-1">Destination</span>
                        {l.original_url}
                      </div>

                      <div className="hidden md:block text-center">
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                          {l.click_count || 0}
                        </span>
                      </div>

                      <div className="hidden md:block text-sm text-gray-500 text-center font-medium">
                        {new Date(l.created_at).toLocaleDateString()}
                      </div>

                      <div className="hidden md:block text-center">
                        {expired ? (
                          <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">Expired</span>
                        ) : l.is_active === false ? (
                          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">Disabled</span>
                        ) : (
                          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">Active</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 md:gap-4 border-t md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0 pl-12 md:pl-0">
                        <div className="md:hidden flex items-center gap-2">
                          <MousePointerClick size={14} className="text-gray-300" />
                          <span className="text-sm font-bold text-gray-700">{l.click_count || 0} clicks</span>
                        </div>
                        <div className="flex gap-4 md:gap-3">
                          <button
                            onClick={() => setEditing(l)}
                            className="p-2 md:p-1 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Pencil size={18} className="text-gray-400 hover:text-indigo-600" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(l.short_code)}
                            className="p-2 md:p-1 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} className="text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-6 md:py-4 gap-4 text-xs md:text-sm text-gray-500 border-t border-gray-100">
              <span className="font-medium">
                Showing <span className="text-gray-900">{(page - 1) * size + 1}–{Math.min(page * size, total)}</span> of <span className="text-gray-900">{total}</span>
              </span>

              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-20 transition-all"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 md:w-9 md:h-9 rounded-xl text-xs font-bold transition-all ${page === i + 1
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                        : "hover:bg-gray-100 text-gray-500"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-20 transition-all"
                >
                  <ChevronRight size={18} />
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] px-0 md:px-4">
            <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 md:p-8 w-full md:w-[400px] shadow-2xl animate-in slide-in-from-bottom md:zoom-in duration-300">
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6 md:hidden" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete link?</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">
                This will permanently delete the link and all associated tracking data. This action cannot be undone.
              </p>
              <div className="flex flex-col md:flex-row justify-end gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="w-full md:w-auto order-2 md:order-1 px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleDelete(confirmDelete)
                    setConfirmDelete(null)
                  }}
                  className="w-full md:w-auto order-1 md:order-2 px-6 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition-all"
                >
                  Delete Permanently
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
