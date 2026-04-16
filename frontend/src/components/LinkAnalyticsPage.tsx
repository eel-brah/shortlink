import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  XAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts"

import {
  ArrowLeft,
  Activity,
  Zap,
  Monitor,
  Globe,
  Smartphone,
  Compass,
} from "lucide-react"

import { getAnalytics } from "../api/analytics"

type StatItem = {
  name: string
  value: number
}

type AnalyticsResponse = {
  original_url: string
  total_clicks: number
  clicks_today: number
  clicks_over_time: { date: string; clicks: number }[]
  devices: StatItem[]
  countries: StatItem[]
  referrers: StatItem[]
  browsers: StatItem[]
  os: StatItem[]
}

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f59e0b"]

export default function LinkAnalyticsPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (code) load()
  }, [code])

  const load = async () => {
    try {
      const res = await getAnalytics(code!)
      setData(res)
    } catch { } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-medium text-gray-500">
        Loading analytics...
      </div>
    )
  }

  if (!data) return null

  const chartData = data.clicks_over_time?.map((d) => ({
    date: new Date(d.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
    clicks: d.clicks,
  })) || []

  const DonutCard = ({ title, items, icon: Icon }: { title: string; items?: StatItem[]; icon: any }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center">
      <div className="flex items-center gap-2 self-start mb-2">
        <Icon size={16} className="text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>

      <div className="w-full h-40">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={items}
              innerRadius={45}
              outerRadius={60}
              paddingAngle={5}
              dataKey="value"
            >
              {items?.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full space-y-1 mt-2">
        {items?.slice(0, 3).map((item, i) => (
          <div key={item.name} className="flex justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-gray-600 truncate max-w-[80px]">{item.name}</span>
            </div>
            <span className="font-bold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <div className="min-h-screen bg-[#f6f7fb] pt-20 pb-12">
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 space-y-6">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Analytics for "{code}"</h1>
                <p className="text-sm text-indigo-500 font-medium truncate max-w-md">{data.original_url}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full" /> LIVE TRACKING
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6 items-stretch">

            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">

              <div className="flex-1 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-gray-400 tracking-wider">
                  <Activity size={16} className="text-indigo-500" />
                  Total Clicks
                </div>
                <h2 className="text-5xl font-black mt-4 text-gray-900">
                  {data.total_clicks.toLocaleString()}
                </h2>
              </div>

              <div className="flex-1 bg-indigo-600 rounded-2xl p-8 shadow-sm text-white flex flex-col justify-center">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-indigo-200 tracking-wider">
                  <Zap size={16} />
                  Clicks Today
                </div>
                <h2 className="text-5xl font-black mt-4">
                  {data.clicks_today.toLocaleString()}
                </h2>
              </div>

            </div>

            <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-sm font-bold text-gray-700 mb-6">Clicks Over Time</h3>
              <div className="w-full flex-1 min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      dy={10}
                    />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="#6366f1"
                      strokeWidth={4}
                      dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DonutCard title="Devices" items={data.devices} icon={Smartphone} />
            <DonutCard title="Countries" items={data.countries} icon={Globe} />
            <DonutCard title="Browsers" items={data.browsers} icon={Compass} />
            <DonutCard title="OS" items={data.os} icon={Monitor} />
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-gray-800">Top Referrers</h3>
              <span className="text-xs text-gray-400 font-medium">Source of traffic</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.referrers.length > 0 ? (
                data.referrers.map((r) => (
                  <div key={r.name} className="bg-gray-50 border border-gray-100 rounded-xl p-5 transition-transform hover:-translate-y-1">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{r.name || "Direct"}</p>
                    <p className="text-2xl font-bold mt-1 text-gray-800">{r.value.toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-gray-400 text-sm italic">No referral data available yet.</div>
              )}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}
