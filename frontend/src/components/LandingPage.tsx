import { useState } from "react"
import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link2, Calendar, Lock, Globe } from "lucide-react"
import {
  Insights,
  QrCode2,
  Folder,
  VerifiedUser,
  Security,
} from "@mui/icons-material"

import Navbar from "./Navbar"
import Footer from "./Footer"
import { shortenUrl } from "../api/urls"
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { BASE_URL, DOMAIN } from "../utils/config";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | any>(null)
  const [url, setUrl] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [alias, setAlias] = useState("")
  const [showAlias, setShowAlias] = useState(false)
  const [showExpire, setShowExpire] = useState(false)
  const qrRef = useRef<SVGSVGElement>(null);

  const { accessToken } = useAuth()
  const { showToast } = useToast()

  const handleSubmit = async () => {
    if (!url) {
      showToast("Please enter a URL", "info")
      return;
    }

    if (!url.startsWith('http') && !url.includes('.')) {
      showToast("Invalid URL format", "error")
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        url,
        custom_alias: alias.trim() || undefined,
      };

      if (expiresAt) {
        const dateObj = new Date(expiresAt);
        if (!isNaN(dateObj.getTime())) {
          payload.expires_at = dateObj.toISOString();
        }
      }

      const res = await shortenUrl(payload);
      setResult(res);

      if (!accessToken) {
        localStorage.setItem("pending_link_code", res.short_code);
      }
      showToast("Link shortened successfully!", "success")
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setUrl("");
    setAlias("");
    setExpiresAt("");
    setShowAlias(false);
    setShowExpire(false);
  };
  const downloadQRCode = () => {
    const svg = qrRef.current;
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-${result.short_code}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const primaryBtn =
    "bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[0.97] active:scale-95 transition disabled:opacity-50 w-full md:w-auto"

  return (
    <div className="bg-[#f6f7fb] min-h-screen text-gray-900 overflow-x-hidden">
      <Navbar />

      <main className="pt-20 md:pt-28">
        {!result && (

          <section className="text-center px-4 md:px-6 pb-16 md:pb-24 max-w-5xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
              Shorten your links,
              <br />
              <span className="text-indigo-600">
                broaden your reach.
              </span>
            </h1>

            <p className="text-gray-500 mt-6 max-w-2xl mx-auto text-sm md:text-base px-4">
              Transform long, complex URLs into powerful marketing assets. Track clicks, manage performance, and engage your audience.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}

              className="mt-10 bg-white rounded-2xl md:rounded-full shadow-[0px_12px_32px_rgba(24,28,30,0.06)] border border-gray-100 flex flex-col md:flex-row items-center p-2 max-w-3xl mx-auto gap-2"
            >
              <div className="flex items-center flex-1 px-4 md:px-6 w-full py-2 md:py-0">
                <span className="material-symbols-outlined text-gray-400 mr-3">link</span>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste your long link here..."
                  className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium text-sm md:text-base"
                />
              </div>
              <button type="submit" disabled={loading} className={primaryBtn}>
                {loading ? "Loading..." : "Shorten"}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>

            <div className="flex justify-center gap-2 md:gap-4 mt-6 flex-wrap px-2">
              {[
                { icon: Link2, label: "Custom Alias" },
                { icon: Calendar, label: "Expiration Date" },
                { icon: Lock, label: "Password Protect" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  onClick={() => {
                    if (label === "Custom Alias") setShowAlias((prev) => !prev)
                    if (label === "Expiration Date") setShowExpire((prev) => !prev)
                    if (label === "Password Protect") showToast("Password protection is available on the Pro plan.", "info")
                  }}
                  className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 md:px-5 md:py-3 rounded-xl text-xs md:text-sm text-gray-600 hover:shadow-md hover:bg-gray-50 transition cursor-pointer active:scale-95"
                >
                  <Icon size={14} className="md:w-4 md:h-4" />
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-4 px-4 flex flex-col items-center">
              {(showAlias || showExpire) && (
                <div
                  className={`mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300 transition-all w-full
                    ${showAlias && showExpire ? "max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6" : "max-w-md mx-auto flex flex-col gap-6"}`}
                >
                  {showAlias && (
                    <div className="text-left">
                      <label className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                        <Link2 size={14} className="text-indigo-500" />
                        Custom Alias
                      </label>

                      <div className="flex items-center bg-white border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 px-3">
                        <span className="text-gray-400 text-xs md:text-sm whitespace-nowrap mr-2">
                          {DOMAIN}/
                        </span>

                        <input
                          value={alias}
                          onChange={(e) => setAlias(e.target.value)}
                          placeholder="my-link"
                          className="flex-1 py-3 outline-none text-sm font-medium bg-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {showExpire && (
                    <div className="text-left">
                      <label className="flex items-center gap-2 text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                        <Calendar size={14} className="text-indigo-500" />
                        Expiration Date
                      </label>
                      <input
                        type="datetime-local"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-medium text-gray-600"
                      />
                    </div>
                  )}

                  <div className={`flex justify-between items-center pt-4 border-t border-gray-100 ${showAlias && showExpire ? "md:col-span-2" : ""}`}>
                    <p className="text-[10px] md:text-[11px] text-gray-400">
                      Leave fields empty for a randomly generated link that never expires.
                    </p>
                    {(alias || expiresAt) && (
                      <button onClick={() => { setAlias(""); setExpiresAt(""); }} className="text-xs font-bold text-red-400 hover:text-red-500 transition">
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {result && (
          <div className="bg-[#f6f7fb] min-h-screen text-gray-900 px-4 md:px-6 pb-24">

            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
              <div className="flex justify-center mb-6">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-indigo-100 flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-indigo-600 text-2xl md:text-3xl">check</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold mb-4 text-indigo-900">Your link is ready!</h1>
              <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto px-4">
                The architecture of your new URL is complete. Optimized for speed and ready to share.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-10">
              <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
                <p className="text-[10px] md:text-xs font-semibold text-indigo-400 mb-3 tracking-wide uppercase">
                  Shortened URL
                </p>

                <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-100 p-3 md:px-5 md:py-4 rounded-xl gap-3">
                  <span className="font-semibold text-indigo-900 truncate w-full text-center sm:text-left">
                    {DOMAIN}/{result.short_code}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${BASE_URL}/${result.short_code}`)
                      showToast("Url copied", "info")
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow hover:scale-95 transition w-full sm:w-auto justify-center"
                  >
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                    Copy
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-50 pt-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 tracking-wide uppercase mb-1">
                      Link Status
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      <span className="text-sm font-medium text-gray-700">Active</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-gray-400 tracking-wide uppercase mb-1">
                      Expiration
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {expiresAt
                        ? new Date(expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                        : "Never"}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-[10px] md:text-xs font-semibold text-gray-400 tracking-wide uppercase">
                    Original Destination
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 truncate mt-1 bg-gray-50 p-2 rounded border border-dashed border-gray-200">
                    {result.original_url}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
                <p className="text-[10px] md:text-xs font-semibold text-indigo-400 mb-4 tracking-wide uppercase">Scan to Access</p>
                <div className="p-3 bg-white rounded-2xl shadow-md border border-gray-50 mb-4">
                  <QRCodeSVG
                    ref={qrRef}
                    value={`${BASE_URL}/${result.short_code}`}
                    size={140}
                    level={"H"}
                    imageSettings={{ src: "/favicon.svg", height: 20, width: 20, excavate: true }}
                  />
                </div>
                <button onClick={downloadQRCode} className="text-indigo-600 text-sm font-semibold flex items-center gap-2 hover:underline">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download QR
                </button>
              </div>
            </div>

            {!accessToken && (
              <div className="max-w-5xl mx-auto rounded-2xl px-6 py-8 md:px-8 md:py-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg text-center md:text-left">
                <div className="text-white">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] md:text-xs opacity-80 mb-2 font-bold uppercase tracking-widest">
                    <span className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></span>
                    Live Performance
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold mb-1">Track real-time analytics</h3>
                  <p className="text-sm opacity-80 max-w-md">See who's clicking, where they are, and what device they're using.</p>
                </div>
                <Link to="/register?claim=true" className="bg-white text-indigo-700 px-6 py-3 rounded-full font-bold shadow hover:scale-105 transition text-sm w-full md:w-auto">
                  Sign up to track this link
                </Link>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-sm text-gray-500">
              <button
                onClick={resetForm}
                className="flex items-center gap-2 hover:text-indigo-600 transition font-semibold group"
              >
                <span className="material-symbols-outlined text-sm">link</span>
                Shorten another link
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${BASE_URL}/${result.short_code}`)
                  showToast("Url copied", "info")
                }}
                className="flex items-center gap-2 hover:text-indigo-600 transition font-semibold">
                <span className="material-symbols-outlined text-lg">share</span>
                Share link
              </button>
            </div>
          </div>

        )}

        <section className="px-4 md:px-8 py-16 md:py-24 bg-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">The Editorial Lens into Your Data</h2>
                <p className="text-gray-500 max-w-xl text-sm md:text-base">We provide authoritative, editorial-grade intelligence for every digital touchpoint.</p>
              </div>
              <button className="text-indigo-600 font-bold flex items-center gap-1">Features <span className="text-xl">→</span></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8 bg-white rounded-xl p-6 md:p-8 shadow relative overflow-hidden">
                <div className="mb-6 relative z-10">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <Insights className="text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold">Editorial Analytics</h3>
                  <p className="text-gray-500 text-sm mt-2 max-w-sm">Get deep insights into clicks, locations, and device types.</p>
                  <div className="flex flex-wrap gap-2 md:gap-3 mt-4">
                    <div className="bg-indigo-50 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-2 border border-indigo-100 text-indigo-700">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      7.2k Clicks Today
                    </div>
                    <div className="bg-gray-50 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-2 border border-gray-100 text-gray-600">
                      <Globe size={14} className="text-gray-400" />
                      142 Countries
                    </div>
                  </div>
                </div>
                <div className="h-40 md:h-48 mt-4 md:-mx-8 md:-mb-8">
                  <img src="/assets/analytics.png" className="w-full h-full object-cover rounded-t-lg md:rounded-none" alt="Analytics" />
                </div>
              </div>

              <div className="md:col-span-4 bg-white rounded-xl p-8 shadow flex flex-col items-center text-center justify-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                  <QrCode2 className="text-indigo-600 text-3xl" />
                </div>
                <h3 className="font-bold">Dynamic QR Codes</h3>
                <p className="text-sm text-gray-500 mt-2 mb-4">Trackable QR codes that bridge the physical and digital worlds.</p>
                <button className="text-indigo-600 text-sm font-bold">Customize QR</button>
              </div>

              <div className="md:col-span-4 bg-indigo-700 text-white rounded-xl p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold mb-2">Bulk Link Management</h3>
                  <p className="text-sm opacity-80">Organize links into workspaces.</p>
                </div>
                <div className="mt-6 space-y-2">
                  <div className="bg-indigo-600 p-3 rounded-lg flex items-center gap-2 border border-indigo-500/30">
                    <Folder fontSize="small" />
                    <span className="text-xs font-medium">Summer Campaign 24</span>
                  </div>
                  <div className="bg-indigo-600 p-3 rounded-lg flex items-center gap-2 border border-indigo-500/30">
                    <Folder fontSize="small" />
                    <span className="text-xs font-medium">Internal Resources</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 bg-white rounded-xl p-6 md:p-8 shadow flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <span className="text-[10px] bg-gray-100 px-3 py-1 rounded-full font-bold text-gray-500 uppercase tracking-widest">ADVANCED SECURITY</span>
                  <h3 className="font-bold text-lg md:text-xl mt-3">Link Protection & Cloaking</h3>
                  <p className="text-gray-500 text-sm mt-2 max-w-md">Hide destination URLs behind custom brand masks while maintaining full SSL security.</p>
                  <div className="flex justify-center md:justify-start gap-4 mt-4 text-indigo-500">
                    <VerifiedUser />
                    <Security />
                    <Lock />
                  </div>
                </div>
                <div className="w-32 h-32 md:w-48 md:h-48 flex-shrink-0">
                  <img src="/assets/security.png" className="w-full h-full object-contain" alt="Security" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center mb-16 md:mb-24">
            <div className="rounded-2xl overflow-hidden shadow-xl order-2 md:order-1">
              <img src="/assets/team.png" className="w-full h-[300px] md:h-[400px] object-cover" alt="Team" />
            </div>
            <div className="order-1 md:order-2 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight italic">Built for the Fluid Architect.</h2>
              <p className="text-gray-500 text-base md:text-lg mb-8 leading-relaxed">
                "ShortLink has completely transformed how we handle our social media traffic. The analytics are editorial-grade and the speed is unmatched."
              </p>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <img src="/assets/user.png" className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100" alt="User" />
                <div className="text-left">
                  <div className="font-bold text-indigo-900">Julian Rivers</div>
                  <div className="text-xs md:text-sm text-gray-500">Creative Director, Flux Agency</div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto rounded-[2rem] p-10 md:p-20 text-center shadow-2xl relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-900">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Ready to scale your impact?</h2>
              <p className="text-indigo-100 mb-10 max-w-xl mx-auto text-sm md:text-base">Join over 10,000+ creators and brands who trust ShortLink for their intelligence needs.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/register" className="bg-white text-indigo-600 font-bold px-10 py-4 rounded-full shadow-lg hover:bg-gray-50 transition text-base">
                  Get Started Free
                </Link>
                <Link to="/pricing" className="border-2 border-white/30 text-white px-10 py-4 rounded-full font-bold hover:bg-white/10 transition text-base">
                  See Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
