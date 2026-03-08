import { motion, AnimatePresence } from "framer-motion"
import { Palette, Check } from "lucide-react"
import { useState } from "react"
import { useTheme, THEMES } from "../context/ThemeContext"

export default function ThemeSwitcher() {
  const { activeTheme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div className="px-6 pb-6 relative">
      {/* Trigger row */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
        style={{
          background: "var(--accent-soft)",
          border: "1px solid var(--accent-border)",
        }}
      >
        {/* Active dot */}
        <div
          className="w-3.5 h-3.5 rounded-full shrink-0"
          style={{
            background: activeTheme.dot,
            boxShadow: `0 0 8px ${activeTheme.dot}`,
          }}
        />
        <div className="flex-1 text-left">
          <p className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
            {activeTheme.name}
          </p>
          <p className="text-[10px]" style={{ color: "#4a5568" }}>
            Active Theme
          </p>
        </div>
        <Palette
          size={14}
          style={{
            color: "var(--accent)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </motion.button>

      {/* Theme picker popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute bottom-full left-6 right-6 mb-2 rounded-2xl overflow-hidden z-50"
            style={{
              background: "rgba(10,15,30,0.97)",
              border: "1px solid rgba(30,42,58,0.9)",
              boxShadow: "0 -16px 48px rgba(0,0,0,0.7)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="p-3">
              <p
                className="text-[10px] font-semibold uppercase tracking-widest px-2 pb-2"
                style={{ color: "#4a5568" }}
              >
                Choose Theme
              </p>
              <div className="space-y-1">
                {THEMES.map((theme) => {
                  const isActive = theme.id === activeTheme.id
                  return (
                    <motion.button
                      key={theme.id}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setTheme(theme.id); setOpen(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                      style={{
                        background: isActive
                          ? `${theme.vars["--accent-soft"]}`
                          : "transparent",
                        border: isActive
                          ? `1px solid ${theme.vars["--accent-border"]}`
                          : "1px solid transparent",
                      }}
                    >
                      {/* Color dot with glow */}
                      <div
                        className="w-4 h-4 rounded-full shrink-0"
                        style={{
                          background: theme.dot,
                          boxShadow: isActive ? `0 0 10px ${theme.dot}88` : "none",
                        }}
                      />
                      <div className="flex-1">
                        <p
                          className="text-xs font-semibold"
                          style={{ color: isActive ? theme.vars["--accent"] : "#8892a4" }}
                        >
                          {theme.name}
                        </p>
                        <p className="text-[10px]" style={{ color: "#4a5568" }}>
                          {theme.description}
                        </p>
                      </div>
                      {isActive && (
                        <Check size={13} style={{ color: theme.vars["--accent"] }} />
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
