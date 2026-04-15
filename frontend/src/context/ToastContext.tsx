import { createContext, useContext, useState, useEffect } from "react"
import { setToast } from "../utils/toast"

type ToastType = "error" | "success" | "warning" | "info"

type Toast = {
  id: number
  message: string
  type: ToastType
}

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("ToastProvider missing")
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: ToastType = "error") => {
    const id = Date.now()

    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
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
            className={`px-6 py-3 rounded-xl shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top
              ${toast.type === "error" && "bg-red-500 text-white"}
              ${toast.type === "success" && "bg-green-500 text-white"}
              ${toast.type === "warning" && "bg-yellow-400 text-black"}
              ${toast.type === "info" && "bg-blue-500 text-white"}
            `}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
