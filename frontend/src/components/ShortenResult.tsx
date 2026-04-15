import { CheckCircle, Copy, Download } from "lucide-react"
import { useState } from "react"

type Props = {
  shortUrl: string
  originalUrl: string
}

export default function ShortenResult({ shortUrl, originalUrl }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="mt-16 text-center max-w-5xl mx-auto">

      <div className="flex flex-col items-center mb-8">
        <CheckCircle className="text-indigo-600 w-10 h-10 mb-4" />

        <h2 className="text-3xl font-bold">
          Your link is ready!
        </h2>

        <p className="text-gray-500 mt-2 max-w-md">
          Your URL is optimized and ready to be shared.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white rounded-xl p-6 shadow text-left">

          <p className="text-xs text-gray-400 mb-2">
            SHORTENED URL
          </p>

          <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg mb-6">
            <span className="font-medium text-indigo-700 truncate">
              {shortUrl}
            </span>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              <Copy size={14} />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <p className="text-xs text-gray-400 mb-2">
            ORIGINAL DESTINATION
          </p>

          <p className="text-sm text-gray-600 truncate">
            {originalUrl}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow flex flex-col items-center justify-center">

          <p className="text-xs text-gray-400 mb-4">
            SCAN TO ACCESS
          </p>

          <div className="w-32 h-32 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
            QR
          </div>

          <button className="flex items-center gap-2 text-indigo-600 text-sm font-semibold">
            <Download size={14} />
            Download QR Code
          </button>
        </div>

      </div>

      <div className="mt-8 bg-indigo-600 text-white rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">

        <div className="text-left">
          <p className="text-xs opacity-80 mb-1">
            ● LIVE PERFORMANCE
          </p>
          <h3 className="font-semibold">
            Track real-time analytics
          </h3>
        </div>

        <button className="bg-white text-indigo-600 px-5 py-2 rounded-lg font-semibold">
          Sign up to track
        </button>
      </div>

    </section>
  )
}
