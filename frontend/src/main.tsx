import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import "./style.css"
import { ToastProvider } from "./context/ToastContext"
import { AuthProvider } from "./context/AuthContext"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider >
    </BrowserRouter>
  </StrictMode>
)
