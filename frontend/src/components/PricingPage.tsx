import { Check } from "lucide-react"
import { useState } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Link } from "react-router-dom"
import { useToast } from "../context/ToastContext"

export default function PricingPage() {
  const [open, setOpen] = useState<number | null>(null)
  const { showToast } = useToast()

  return (
    <div className="bg-[#f6f7fb] min-h-screen text-gray-900 overflow-x-hidden">
      <Navbar />

      <main className="pt-24 md:pt-28 px-4 md:px-6">
        <section className="text-center max-w-3xl mx-auto mb-12 md:mb-16 px-2">
          <span className="text-[10px] md:text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full font-bold tracking-widest uppercase">
            Pricing Plans
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-6 leading-tight">
            Scale your impact with
            <br />
            <span className="text-indigo-600">
              ShortLink precision.
            </span>
          </h1>

          <p className="text-gray-500 mt-4 text-sm md:text-base px-2">
            From individual creators to global enterprises, we provide the tools to shorten, track, and optimize every digital interaction.
          </p>
        </section>

        <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 mb-20">

          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Free</h3>
              <div className="text-3xl font-bold mb-2">
                $0 <span className="text-sm text-gray-500 font-medium">/month</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Perfect for personal use and getting started with secure link shortening.
              </p>
              <ul className="space-y-4">
                {[
                  "Unlimited clicks & QR scans",
                  "300 links",
                  "Custom aliases",
                  "30-days data retention",
                  "Analytics",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-indigo-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              to="/register"
              className="mt-8 w-full py-3 rounded-xl border text-sm font-semibold text-center block hover:bg-gray-50 transition active:scale-95"
            >
              Start for Free
            </Link>
          </div>

          <div className="relative bg-white rounded-2xl p-6 md:p-8 border border-indigo-200 shadow-lg md:scale-[1.03] flex flex-col justify-between order-first md:order-none">
            <div className="md:absolute md:-top-3 md:left-1/2 md:-translate-x-1/2 mb-3 md:mb-0 flex justify-center">
              <span className="bg-indigo-600 text-white text-[10px] px-3 py-1 rounded-full font-bold shadow uppercase tracking-wider">
                Most Popular
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-600 mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-2">
                $12 <span className="text-sm text-gray-500 font-medium">/month</span>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                For professional creators who need deep insights and branded connections.
              </p>
              <ul className="space-y-4">
                {[
                  "Everything in Free",
                  "3000 links",
                  "Advanced analytics dashboard",
                  "1-year data retention",
                  "Password protected links",
                  "Priority email support",
                  "UTM Builder",
                  "Advanced QR Code customizations",
                  "Organize your links",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-white" />
                    </div>
                    <span className="font-bold">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => showToast("Coming Soon", "info")}
              className="mt-8 w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 active:scale-95 transition"
            >
              Get Pro Now
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Enterprise</h3>
              <div className="text-3xl font-bold mb-2">Custom</div>
              <p className="text-sm text-gray-500 mb-6">
                Full-scale link infrastructure for teams and high-traffic organizations.
              </p>
              <ul className="space-y-4 text-sm">
                {[
                  { icon: "grid_view", label: "Team & Role management" },
                  { icon: "api", label: "Full API access & Webhooks" },
                  { icon: "support_agent", label: "Dedicated support manager" },
                  { icon: "shield", label: "SAML/SSO Authentication" },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-indigo-600 text-[18px] flex-shrink-0">
                      {item.icon}
                    </span>
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => showToast("Coming Soon", "info")}
              className="mt-8 w-full py-3 rounded-xl border text-sm font-semibold hover:bg-gray-50 transition active:scale-95"
            >
              Contact Sales
            </button>
          </div>
        </section>

        <section className="max-w-6xl mx-auto bg-white rounded-2xl p-6 md:p-10 shadow mb-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-3 leading-tight">
              Trust but verify. Analytics for every click.
            </h2>
            <p className="text-gray-500 mb-6 text-sm md:text-base">
              Our Fluid Architect system processes over 10 million links daily. With Pro and Enterprise, you don't just see numbers—you see behaviors, locations, and conversion paths in real-time.
            </p>
            <div className="flex flex-wrap gap-4 md:gap-6">
              <div className="bg-gray-100 px-4 py-3 md:px-6 md:py-4 rounded-xl flex-1 text-center min-w-[120px]">
                <div className="text-indigo-600 font-bold text-lg md:text-xl">99.9%</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Uptime SLA</div>
              </div>
              <div className="bg-gray-100 px-4 py-3 md:px-6 md:py-4 rounded-xl flex-1 text-center min-w-[120px]">
                <div className="text-indigo-600 font-bold text-lg md:text-xl">&lt;50ms</div>
                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Redirect Speed</div>
              </div>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg border border-gray-50">
            <img src="/assets/analytics-nondark.jpg" className="w-full h-auto" alt="Analytics preview" />
          </div>
        </section>

        <section className="max-w-3xl mx-auto mb-20 px-2">
          <h2 className="text-center text-2xl font-bold mb-8">
            Frequently Asked Questions
          </h2>

          {[
            {
              q: "Can I change my plan later?",
              a: "Yes, you can upgrade or downgrade your plan at any time from your dashboard. Changes take effect immediately.",
            },
            {
              q: "What are custom aliases?",
              a: "Custom aliases let you create branded short links like ShortLink.io/my-brand instead of random codes.",
            },
            {
              q: "How secure are the links?",
              a: "All links are protected with HTTPS, optional password protection, and advanced security features on higher plans.",
            },
            {
              q: "Do you offer discounts for non-profits?",
              a: "Yes, we offer special pricing for non-profits and educational organizations. Contact support for details.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-4 mb-3 shadow-sm cursor-pointer transition-all hover:shadow-md border border-gray-50"
              onClick={() => setOpen(open === i ? null : i)}
            >
              <div className="flex justify-between items-center gap-4">
                <span className="font-semibold text-sm md:text-base">{item.q}</span>
                <span className={`transition-transform duration-300 ${open === i ? "rotate-180" : ""}`}>
                  ⌄
                </span>
              </div>
              {open === i && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-xs md:text-sm text-gray-500 mt-3 leading-relaxed border-t pt-3">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  )
}
