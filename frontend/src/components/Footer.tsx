export default function Footer() {
  return (
    <footer className="bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">

        <div className="text-center md:text-left">
          <div className="font-semibold text-indigo-900 text-sm">
            ShortLink
          </div>
          <div className="text-[11px] text-gray-500">
            © 2026 ShortLink. All rights reserved.
          </div>
        </div>

        <div className="flex gap-5">
          <a className="text-[11px] text-gray-400 hover:text-indigo-500 transition">
            Terms
          </a>
          <a className="text-[11px] text-gray-400 hover:text-indigo-500 transition">
            Privacy
          </a>
          <a className="text-[11px] text-gray-400 hover:text-indigo-500 transition">
            API
          </a>
          <a className="text-[11px] text-gray-400 hover:text-indigo-500 transition">
            Status
          </a>
        </div>

      </div>
    </footer>
  )
}
