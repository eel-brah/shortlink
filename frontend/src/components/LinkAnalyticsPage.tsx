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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 flex flex-col items-center">
      <div className="flex items-center gap-2 self-start mb-2">
        <Icon size={16} className="text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      </div>

      <div className="w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
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
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full space-y-1 mt-2">
        {items?.slice(0, 3).map((item, i) => (
          <div key={item.name} className="flex justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-gray-600 truncate max-w-[100px]">{item.name}</span>
            </div>
            <span className="font-bold text-gray-800">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <div className="min-h-screen bg-[#f6f7fb] pt-20 pb-12 overflow-x-hidden">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6 md:space-y-8">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors flex-shrink-0"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate">Analytics for "{code}"</h1>
                <p className="text-xs md:text-sm text-indigo-500 font-medium truncate max-w-[250px] md:max-w-md">{data.original_url}</p>
              </div>
            </div>
            <div className="flex items-center self-start sm:self-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] md:text-xs font-bold animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full" /> LIVE TRACKING
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 md:gap-6 items-stretch">

            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 md:gap-6">
              <div className="flex-1 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase text-gray-400 tracking-wider">
                  <Activity size={16} className="text-indigo-500" />
                  Total Clicks
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mt-3 md:mt-4 text-gray-900 tracking-tight">
                  {data.total_clicks.toLocaleString()}
                </h2>
              </div>

              <div className="flex-1 bg-indigo-600 rounded-2xl p-6 md:p-8 shadow-sm text-white flex flex-col justify-center shadow-lg shadow-indigo-100">
                <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase text-indigo-200 tracking-wider">
                  <Zap size={16} />
                  Clicks Today
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mt-3 md:mt-4 tracking-tight">
                  {data.clicks_today.toLocaleString()}
                </h2>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-xs md:text-sm font-bold text-gray-700 mb-6 uppercase tracking-wide">Clicks Over Time</h3>
              <div className="w-full flex-1 min-h-[250px] md:min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      dy={10}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <DonutCard title="Devices" items={data.devices} icon={Smartphone} />
            <DonutCard title="Countries" items={data.countries} icon={Globe} />
            <DonutCard title="Browsers" items={data.browsers} icon={Compass} />
            <DonutCard title="OS" items={data.os} icon={Monitor} />
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h3 className="font-bold text-gray-800 text-sm md:text-base">Top Referrers</h3>
              <span className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider">Traffic Source</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.referrers.length > 0 ? (
                data.referrers.map((r) => (
                  <div key={r.name} className="bg-gray-50 border border-gray-100 rounded-xl p-4 md:p-5 transition-all hover:border-indigo-100 group">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">{r.name || "Direct"}</p>
                    <p className="text-xl md:text-2xl font-bold mt-1 text-gray-800">{r.value.toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-gray-400 text-xs md:text-sm italic bg-gray-50/50 rounded-xl border border-dashed">
                  No referral data available yet.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  )
}
