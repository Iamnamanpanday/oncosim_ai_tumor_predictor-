import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Download, AlertCircle, X } from "lucide-react"

const icons = {
  success: CheckCircle2,
  export: Download,
  error: AlertCircle,
}

const colors = {
  success: { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)" },
  export:  { color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)" },
  error:   { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
}

export default function Toast({ toasts, removeToast }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2"
      style={{ pointerEvents: "none" }}
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = icons[t.type] ?? CheckCircle2
          const c = colors[t.type] ?? colors.success
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
              style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                color: "#e8edf5",
                pointerEvents: "auto",
                backdropFilter: "blur(12px)",
                minWidth: 240,
              }}
            >
              <Icon size={16} style={{ color: c.color, flexShrink: 0 }} />
              <span className="flex-1 font-medium">{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                style={{ color: "#4a5568" }}
                className="hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// Hook to manage toasts
import { useState, useCallback } from "react"

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}
