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

export default function LandingPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<null | any>(null)
  const [url, setUrl] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [alias, setAlias] = useState("")
  const [showAlias, setShowAlias] = useState(false)
  const [showExpire, setShowExpire] = useState(false)
  const qrRef = useRef<SVGSVGElement>(null);


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

      showToast("Link shortened successfully!", "success")
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
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
    "bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-[0.97] active:scale-95 transition disabled:opacity-50"

  return (
    <div className="bg-[#f6f7fb] min-h-screen text-gray-900">

      <Navbar />

      <main className="pt-28">

        {!result && (
          <section className="text-center px-6 pb-24 max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
              Shorten your links,
              <br />
              <span className="text-indigo-600">
                broaden your reach.
              </span>
            </h1>

            <p className="text-gray-500 mt-6 max-w-2xl mx-auto">
              Transform long, complex URLs into powerful marketing assets. Track clicks, manage performance, and engage your audience.
            </p>


            <div className="mt-10 bg-white rounded-full shadow-[0px_12px_32px_rgba(24,28,30,0.06)] border border-gray-100 flex items-center p-2 max-w-3xl mx-auto">
              <div className="flex items-center flex-1 px-6">
                <span className="material-symbols-outlined text-gray-400 mr-3">link</span>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste your long link here..."
                  className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 font-medium"
                />
              </div>
              <button onClick={handleSubmit} disabled={loading} className={primaryBtn}>
                {loading ? "Loading..." : "Shorten"}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>


            <div className="flex justify-center gap-4 mt-6 flex-wrap">
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
                  className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-3 rounded-xl text-sm text-gray-600 hover:shadow-md hover:bg-gray-50 transition cursor-pointer active:scale-95"
                >
                  <Icon size={16} />
                  {label}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col items-center">
              {(showAlias || showExpire) && (
                <div
                  className={`mt-6 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300 transition-all
      ${showAlias && showExpire
                      ? "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full"
                      : "max-w-md w-full mx-auto flex flex-col gap-6"
                    }`}
                >

                  {showAlias && (
                    <div className="text-left">
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                        <Link2 size={14} className="text-indigo-500" />
                        Custom Alias
                      </label>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          ShortLink.io/
                        </span>

                        <input
                          value={alias}
                          onChange={(e) => setAlias(e.target.value)}
                          placeholder="my-link"
                          className="w-full pl-24 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-medium"
                        />
                      </div>
                    </div>
                  )}

                  {showExpire && (
                    <div className="text-left">
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
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

                  <div
                    className={`flex justify-between items-center pt-4 border-t border-gray-100
        ${showAlias && showExpire ? "md:col-span-2" : ""}`}
                  >
                    <p className="text-[11px] text-gray-400">
                      Leave fields empty for a randomly generated link that never expires.
                    </p>

                    {(alias || expiresAt) && (
                      <button
                        onClick={() => {
                          setAlias("")
                          setExpiresAt("")
                        }}
                        className="text-xs font-bold text-red-400 hover:text-red-500 transition"
                      >
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
          <div className="bg-[#f6f7fb] min-h-screen text-gray-900 px-6 pb-24">

            <div className="text-center max-w-2xl mx-auto mb-14">

              <div className="flex justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-indigo-600 text-3xl">
                    check
                  </span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-indigo-900">
                Your link is ready!
              </h1>

              <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
                The architecture of your new URL is complete. It's optimized for speed and ready to be shared.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-10">

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

                <p className="text-xs font-semibold text-indigo-400 mb-3 tracking-wide">
                  SHORTENED URL
                </p>

                <div className="flex justify-between items-center bg-gray-100 px-5 py-4 rounded-xl">

                  <span className="font-semibold text-indigo-900 truncate">
                    indigo.link/{result.short_code}
                  </span>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `http://localhost:8000/${result.short_code}`
                      )

                      showToast("Url copied", "info")
                    }
                    }
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow hover:scale-95 active:scale-90 transition"
                  >
                    <span className="material-symbols-outlined text-sm">
                      content_copy
                    </span>
                    Copy Link
                  </button>
                </div>

                {expiresAt && (
                  <p className="mt-6 text-xs font-semibold text-gray-400 tracking-wide">
                    Expires at: {new Date(expiresAt).toLocaleString()}
                  </p>
                )}
                <p className="mt-6 text-xs font-semibold text-gray-400 tracking-wide">
                  ORIGINAL DESTINATION
                </p>

                <p className="text-sm text-gray-500 truncate mt-1">
                  {result.original_url}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
                <p className="text-xs font-semibold text-indigo-400 mb-4 tracking-wide uppercase">
                  Scan to Access
                </p>

                <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-50 mb-4">
                  <QRCodeSVG
                    ref={qrRef}
                    value={`http://localhost:8000/${result.short_code}`}
                    size={160}
                    level={"H"} // High error correction
                    imageSettings={{
                      src: "/favicon.svg", // Optional: Put your logo in the middle
                      x: undefined,
                      y: undefined,
                      height: 24,
                      width: 24,
                      excavate: true,
                    }}
                  />
                </div>

                <button
                  onClick={downloadQRCode}
                  className="text-indigo-600 text-sm font-semibold flex items-center gap-2 hover:underline"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download QR Code
                </button>
              </div>
            </div>

            <div className="max-w-5xl mx-auto rounded-2xl px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6 mb-8 bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg">

              <div className="text-white text-left">

                <div className="flex items-center gap-2 text-xs opacity-80 mb-2">
                  <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                  LIVE PERFORMANCE
                </div>

                <h3 className="text-lg font-semibold mb-1">
                  Track real-time analytics
                </h3>

                <p className="text-sm opacity-80 max-w-md">
                  See who's clicking, where they are, and what device they're using.
                </p>
              </div>

              <Link to="/register"
                className="bg-white text-indigo-700 px-6 py-3 rounded-full font-semibold shadow hover:scale-95 active:scale-90 transition">
                Sign up to track and manage this link
              </Link>
            </div>

            <div className="flex justify-center gap-10 text-sm text-gray-500">

              <button
                onClick={() => {
                  setResult(null)
                  setUrl("")
                  setExpiresAt("")
                  setAlias("")
                }}
                className="flex items-center gap-2 hover:text-indigo-600 transition active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">link</span>
                Shorten another link
              </button>

              <button className="flex items-center gap-2 hover:text-indigo-600 transition active:scale-95">
                <span className="material-symbols-outlined text-sm">share</span>
                Share to social
              </button>
            </div>

          </div>
        )}

        <section className="px-8 py-24 bg-gray-100">
          <div className="max-w-7xl mx-auto">

            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  The Editorial Lens into Your Data
                </h2>
                <p className="text-gray-500 max-w-xl">
                  We don't just shorten links; we provide authoritative, editorial-grade intelligence for every digital touchpoint.
                </p>
              </div>

              <button className="text-indigo-600 font-semibold">
                Features →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

              <div className="md:col-span-8 bg-white rounded-xl p-8 shadow relative overflow-hidden">

                <div className="mb-6">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <Insights className="text-indigo-600" />
                  </div>

                  <h3 className="text-xl font-bold">Editorial Analytics</h3>
                  <p className="text-gray-500 text-sm mt-2 max-w-sm">
                    Get deep insights into who is clicking your links, from where, and on what device.
                  </p>

                  <div className="flex gap-3 mt-4">

                    <div className="bg-indigo-100 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2">

                      <span className="w-2 h-2 rounded-full bg-green-500"></span>

                      <span>7.2k Clicks Today</span>
                    </div>

                    <div className="bg-gray-100 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2">

                      <Globe size={14} className="text-gray-500" />

                      <span>142 Countries</span>
                    </div>

                  </div>
                </div>

                <div className="h-48 -mx-8 -mb-8">
                  <img
                    src="/assets/analytics.png"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="md:col-span-4 bg-white rounded-xl p-8 shadow flex flex-col items-center text-center justify-center">

                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                  <QrCode2 className="text-indigo-600 text-3xl" />
                </div>

                <h3 className="font-semibold">Dynamic QR Codes</h3>
                <p className="text-sm text-gray-500 mt-2 mb-4">
                  Create high-resolution, trackable QR codes that bridge the physical and digital worlds.
                </p>

                <button className="text-indigo-600 text-sm font-semibold">
                  Customize QR
                </button>
              </div>

              <div className="md:col-span-4 bg-indigo-700 text-white rounded-xl p-6 flex flex-col justify-between">

                <div>
                  <h3 className="font-semibold mb-2">
                    Bulk Link Management
                  </h3>
                  <p className="text-sm opacity-80">
                    Organize links into workspaces.
                  </p>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="bg-indigo-600 p-3 rounded-lg flex items-center gap-2">
                    <Folder fontSize="small" />
                    <span className="text-xs">Summer Campaign 24</span>
                  </div>

                  <div className="bg-indigo-600 p-3 rounded-lg flex items-center gap-2">
                    <Folder fontSize="small" />
                    <span className="text-xs">Internal Resources</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 bg-white rounded-xl p-8 shadow flex items-center justify-between gap-6">

                <div>
                  <span className="text-xs bg-gray-100 px-3 py-1 rounded-full font-semibold">
                    ADVANCED SECURITY
                  </span>

                  <h3 className="font-bold text-lg mt-3">
                    Link Protection & Cloaking
                  </h3>

                  <p className="text-gray-500 text-sm mt-2 max-w-md">
                    Hide your destination URLs behind custom brand masks while maintaining full SSL security and GDPR compliance.
                  </p>

                  <div className="flex gap-3 mt-4 text-indigo-600">
                    <VerifiedUser />
                    <Security />
                    <Lock />
                  </div>
                </div>

                <div className="w-60 h-60">
                  <img
                    src="/assets/security.png"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        <section className="py-24 px-6 max-w-7xl mx-auto">

          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">

            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src="/assets/team.png"
                className="w-full h-[400px] object-cover"
              />
            </div>

            <div>
              <h2 className="text-4xl font-bold mb-6 leading-tight">
                Built for the Fluid Architect.
              </h2>

              <p className="text-gray-500 italic mb-8">
                "ShortLink has completely transformed how we handle our social media
                traffic. The analytics are editorial-grade and the speed is unmatched
                in the market today."
              </p>

              <div className="flex items-center gap-4">
                <img
                  src="/assets/user.png"
                  className="w-12 h-12 rounded-full object-cover"
                />

                <div>
                  <div className="font-semibold">Julian Rivers</div>
                  <div className="text-sm text-gray-500">
                    Creative Director, Flux Agency
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto rounded-3xl p-12 md:p-16 text-center shadow-xl relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-800">

            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to scale your impact?
              </h2>

              <p className="text-indigo-100 mb-10 max-w-xl mx-auto">
                Join over 10,000+ creators and brands who trust Indigo Link for their intelligence needs.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">

                <Link
                  to="/register"
                  className="bg-white text-indigo-600 font-semibold px-8 py-4 rounded-full shadow hover:scale-105 transition"
                >
                  Get Started Free
                </Link>

                <Link
                  to="/pricing"
                  className="border border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition"
                >
                  Pricing
                </Link>

              </div>
            </div>

          </div>

        </section>
      </main>

      <Footer />
    </div >
  )
}
