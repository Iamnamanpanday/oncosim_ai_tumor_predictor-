import { motion, AnimatePresence } from "framer-motion"
import { History, Trash2, TrendingDown, TrendingUp, Activity, FlaskConical } from "lucide-react"

function outcomeLabel(pct) {
  if (pct >= 90) return { label: "Eradicated", color: "#10b981" }
  if (pct >= 50) return { label: "Controlled", color: "#3b82f6" }
  if (pct >= 10) return { label: "Partial", color: "#f59e0b" }
  return { label: "Progressing", color: "#dc143c" }
}

export default function SavedRunsPage({ runs, onDelete, onClearAll }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest"
              style={{
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.25)",
                color: "#818cf8",
              }}
            >
              {runs.length} Saved
            </span>
          </div>
          {runs.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onClearAll}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all"
              style={{
                background: "rgba(220,20,60,0.08)",
                border: "1px solid rgba(220,20,60,0.2)",
                color: "#ff4d70",
              }}
            >
              <Trash2 size={12} />
              Clear All
            </motion.button>
          )}
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Run History</h1>
        <p className="text-base max-w-2xl" style={{ color: "#8892a4" }}>
          All saved simulation runs, stored locally in your browser.
        </p>
      </motion.div>

      <div
        className="h-px"
        style={{
          background:
            "linear-gradient(90deg, rgba(99,102,241,0.4) 0%, rgba(30,42,58,0.5) 60%, transparent 100%)",
        }}
      />

      {/* Empty state */}
      {runs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.2)",
            }}
          >
            <History size={28} style={{ color: "#818cf8" }} />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">No Saved Runs Yet</h3>
          <p className="text-sm" style={{ color: "#4a5568" }}>
            Run a simulation and click "Save Run" to record it here.
          </p>
        </motion.div>
      )}

      {/* Runs list */}
      <div className="space-y-4">
        <AnimatePresence>
          {runs.map((run, i) => {
            const outcome = outcomeLabel(run.metrics.reduction_percent)
            return (
              <motion.div
                key={run.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(19,25,40,0.8)",
                  border: "1px solid rgba(30,42,58,0.8)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{
                        background: "rgba(99,102,241,0.15)",
                        border: "1px solid rgba(99,102,241,0.3)",
                      }}
                    >
                      <FlaskConical size={16} style={{ color: "#818cf8" }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Run #{runs.length - i}
                      </h3>
                      <p className="text-xs" style={{ color: "#4a5568" }}>
                        {run.timestamp}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        background: `${outcome.color}22`,
                        border: `1px solid ${outcome.color}44`,
                        color: outcome.color,
                      }}
                    >
                      {outcome.label}
                    </span>
                    <button
                      onClick={() => onDelete(run.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: "#4a5568" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4d70")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#4a5568")}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Params */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { label: "N₀", val: run.params.initial_size },
                    { label: "r", val: run.params.growth_rate },
                    { label: "c", val: run.params.chemo_strength },
                    { label: "Days", val: run.params.days },
                  ].map((p) => (
                    <span
                      key={p.label}
                      className="text-xs font-mono px-2.5 py-1 rounded-lg"
                      style={{
                        background: "rgba(8,11,18,0.7)",
                        border: "1px solid rgba(30,42,58,0.8)",
                        color: "#8892a4",
                      }}
                    >
                      {p.label} ={" "}
                      <span className="text-white font-semibold">{p.val}</span>
                    </span>
                  ))}
                </div>

                {/* Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: "Peak", val: run.metrics.peak_size.toFixed(0), unit: "cells", icon: TrendingUp, color: "#f59e0b" },
                    { label: "Final", val: run.metrics.final_size.toFixed(0), unit: "cells", icon: Activity, color: "#3b82f6" },
                    { label: "Reduction", val: run.metrics.reduction_percent.toFixed(1), unit: "%", icon: TrendingDown, color: outcome.color },
                  ].map((m) => {
                    const Icon = m.icon
                    return (
                      <div
                        key={m.label}
                        className="rounded-xl p-3"
                        style={{
                          background: "rgba(8,11,18,0.6)",
                          border: "1px solid rgba(30,42,58,0.8)",
                        }}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon size={12} style={{ color: m.color }} />
                          <p className="text-xs" style={{ color: "#4a5568" }}>
                            {m.label}
                          </p>
                        </div>
                        <p className="text-lg font-bold font-mono" style={{ color: m.color }}>
                          {m.val}
                          <span className="text-xs font-normal ml-1" style={{ color: "#4a5568" }}>
                            {m.unit}
                          </span>
                        </p>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
