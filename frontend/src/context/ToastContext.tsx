import { createContext, useContext, useState, useEffect, useRef } from "react"
import { setToast } from "../utils/toast"
import type { ToastType } from "../utils/types"

type Toast = {
  id: number
  message: string
  type: ToastType
  duration: number
}

type ToastContextType = {
  showToast: (message: string, type?: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("ToastProvider missing")
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<number, { timeout: any; start: number; remaining: number }>>(new Map())

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    timers.current.delete(id)
  }

  const startTimer = (id: number, duration: number) => {
    const start = Date.now()

    const timeout = setTimeout(() => {
      removeToast(id)
    }, duration)

    timers.current.set(id, { timeout, start, remaining: duration })
  }

  const pauseTimer = (id: number) => {
    const timer = timers.current.get(id)
    if (!timer) return

    clearTimeout(timer.timeout)
    const elapsed = Date.now() - timer.start
    timer.remaining -= elapsed
  }

  const resumeTimer = (id: number) => {
    const timer = timers.current.get(id)
    if (!timer) return

    timer.start = Date.now()
    timer.timeout = setTimeout(() => removeToast(id), timer.remaining)
  }

  const showToast = (
    message: string,
    type: ToastType = "error",
    duration: number = 3000
  ) => {
    const id = Date.now()

    setToasts((prev) => [...prev, { id, message, type, duration }])
    startTimer(id, duration)
  }

  useEffect(() => {
    setToast(showToast)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 space-y-3 flex flex-col items-center">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onMouseEnter={() => pauseTimer(toast.id)}
            onMouseLeave={() => resumeTimer(toast.id)}
            className={`relative overflow-hidden px-6 py-3 rounded-xl shadow-lg text-sm font-medium
              ${toast.type === "error" && "bg-red-500 text-white"}
              ${toast.type === "success" && "bg-green-500 text-white"}
              ${toast.type === "warning" && "bg-yellow-400 text-black"}
              ${toast.type === "info" && "bg-blue-500 text-white"}
            `}
          >
            {toast.message}

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-black/20 w-full">
              <div
                className="h-full bg-white/70"
                style={{
                  animation: `progress ${toast.duration}ms linear forwards`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
