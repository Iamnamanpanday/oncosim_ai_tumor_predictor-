import { motion } from "framer-motion"
import { Dna, FlaskConical, Microscope, BookOpen, Info, History, ChevronRight } from "lucide-react"
import ThemeSwitcher from "./ThemeSwitcher"

const navItems = [
  { icon: FlaskConical, label: "Simulator",  id: "simulator" },
  { icon: Microscope,   label: "Model Info", id: "model-info" },
  { icon: BookOpen,     label: "Experiments",id: "experiments" },
  { icon: History,      label: "History",    id: "history" },
  { icon: Info,         label: "About",      id: "about" },
]

export default function Sidebar({ activeNav, setActiveNav, runsCount = 0 }) {
  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="fixed left-0 top-0 h-full w-64 flex flex-col z-50"
      style={{
        background: "linear-gradient(180deg, var(--bg-sidebar-from) 0%, var(--bg-sidebar-to) 100%)",
        borderRight: "1px solid rgba(30,42,58,0.8)",
      }}
    >
      {/* Logo */}
      <div className="px-6 py-8">
        <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.02 }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)",
              boxShadow: "0 0 20px var(--accent-glow)",
            }}
          >
            <Dna size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-wide">OncoSim</h1>
            <p className="text-xs" style={{ color: "#8892a4" }}>Tumor Simulator</p>
          </div>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="mx-6 mb-6 h-px" style={{ background: "rgba(30,42,58,0.8)" }} />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        <p className="px-3 mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "#4a5568" }}>
          Navigation
        </p>
        {navItems.map((item, i) => {
          const Icon = item.icon
          const isActive = activeNav === item.id
          const showSimBadge   = item.id === "simulator" && runsCount > 0 && !isActive
          const showHistBadge  = item.id === "history"   && runsCount > 0 && !isActive

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 + 0.2 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveNav(item.id)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group"
              style={{
                background: isActive ? "var(--accent-dim)" : "transparent",
                border: isActive ? "1px solid var(--accent-border-hi)" : "1px solid transparent",
                color: isActive ? "var(--accent-light)" : "#8892a4",
              }}
            >
              <Icon
                size={18}
                style={{ color: isActive ? "var(--accent)" : "#4a5568" }}
                className="transition-colors"
              />
              <span className="text-sm font-medium flex-1">{item.label}</span>

              {showSimBadge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "var(--accent-dim)",
                    border: "1px solid var(--accent-border)",
                    color: "var(--accent-light)",
                    minWidth: 18,
                    textAlign: "center",
                  }}
                >
                  {runsCount}
                </motion.span>
              )}

              {showHistBadge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(99,102,241,0.2)",
                    border: "1px solid rgba(99,102,241,0.3)",
                    color: "#818cf8",
                    minWidth: 18,
                    textAlign: "center",
                  }}
                >
                  {runsCount}
                </motion.span>
              )}

              {isActive && (
                <ChevronRight size={14} style={{ color: "var(--accent)" }} />
              )}
            </motion.button>
          )
        })}
      </nav>

      {/* Formula badge */}
      <div className="px-6 py-4">
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--accent-soft)",
            border: "1px solid var(--accent-border)",
          }}
        >
          <p className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
            Logistic Growth Model
          </p>
          <p className="text-xs mt-1" style={{ color: "#4a5568" }}>
            dN/dt = rN(1 – N/K) – cN
          </p>
        </div>
      </div>

      {/* Theme Switcher */}
      <ThemeSwitcher />
    </motion.aside>
  )
}
