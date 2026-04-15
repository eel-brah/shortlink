type ToastType = "error" | "success" | "warning" | "info"

let toastFn: ((message: string, type?: ToastType) => void) | null = null

export const setToast = (fn: typeof toastFn) => {
  toastFn = fn
}

export const toast = (message: string, type: ToastType = "error") => {
  toastFn?.(message, type)
}
