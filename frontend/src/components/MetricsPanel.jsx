import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Activity, ShieldCheck, ShieldAlert, Siren } from "lucide-react"
import { useEffect, useState, useRef } from "react"

// Animated count-up hook
function useCountUp(target, duration = 1200, decimals = 0) {
  const [value, setValue] = useState(0)
  const start = useRef(null)
  const frame = useRef(null)

  useEffect(() => {
    setValue(0)
    start.current = null
    const step = (ts) => {
      if (start.current === null) start.current = ts
      const progress = Math.min((ts - start.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(parseFloat((eased * target).toFixed(decimals)))
      if (progress < 1) frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [target, duration, decimals])

  return value
}

function outcomeInfo(pct) {
  if (pct >= 90) return { label: "Eradicated",   color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  Icon: ShieldCheck }
  if (pct >= 50) return { label: "Controlled",   color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)",  Icon: ShieldCheck }
  if (pct >= 10) return { label: "Partial Resp.", color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)",  Icon: ShieldAlert }
  return           { label: "Progressing",       color: "#dc143c", bg: "rgba(220,20,60,0.1)",   border: "rgba(220,20,60,0.25)",   Icon: Siren }
}

const cardDefs = [
  {
    key: "peak_size",
    label: "Peak Tumor Size",
    unit: "cells",
    icon: TrendingUp,
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.2)",
    border: "rgba(245,158,11,0.25)",
    decimals: 0,
  },
  {
    key: "final_size",
    label: "Final Tumor Size",
    unit: "cells",
    icon: Activity,
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.2)",
    border: "rgba(59,130,246,0.25)",
    decimals: 0,
  },
  {
    key: "reduction_percent",
    label: "Tumor Reduction",
    unit: "%",
    icon: TrendingDown,
    color: "#10b981",
    glow: "rgba(16,185,129,0.2)",
    border: "rgba(16,185,129,0.25)",
    decimals: 1,
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
}

function MetricCard({ card, value }) {
  const Icon = card.icon
  const displayed = useCountUp(value, 1100, card.decimals)

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.03, y: -4 }}
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{
        background: "rgba(19,25,40,0.9)",
        border: `1px solid ${card.border}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {/* Glow bg */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 pointer-events-none"
        style={{ background: card.glow, filter: "blur(30px)" }}
      />

      <div className="relative z-10">
        {/* Icon */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
          style={{ background: card.glow, border: `1px solid ${card.border}` }}
        >
          <Icon size={18} style={{ color: card.color }} />
        </div>

        {/* Animated value */}
        <div className="flex items-end gap-1 mb-1.5">
          <span className="text-3xl font-bold text-white font-mono tracking-tight">
            {card.decimals > 0 ? displayed.toFixed(card.decimals) : Math.round(displayed)}
          </span>
          <span className="text-sm mb-1 font-medium" style={{ color: card.color }}>
            {card.unit}
          </span>
        </div>

        <p className="text-xs font-medium" style={{ color: "#8892a4" }}>{card.label}</p>

        {/* Bottom bar */}
        <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ background: "rgba(30,42,58,0.8)" }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: card.key === "reduction_percent" ? `${Math.min(value, 100)}%` : "60%" }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            style={{ background: `linear-gradient(90deg, ${card.color}88, ${card.color})` }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function MetricsPanel({ metrics }) {
  if (!metrics) return null

  const outcome = outcomeInfo(metrics.reduction_percent)
  const OutcomeIcon = outcome.Icon

  return (
    <div className="space-y-4">
      {/* Treatment Outcome Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="flex items-center gap-3 px-5 py-3 rounded-xl"
        style={{
          background: outcome.bg,
          border: `1px solid ${outcome.border}`,
        }}
      >
        <OutcomeIcon size={18} style={{ color: outcome.color }} />
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: outcome.color }}>
            Treatment Outcome
          </span>
          <p className="text-base font-bold text-white">
            {outcome.label}
          </p>
        </div>
        <div className="ml-auto">
          <span
            className="text-2xl font-bold font-mono"
            style={{ color: outcome.color }}
          >
            {metrics.reduction_percent.toFixed(1)}%
          </span>
          <span className="text-xs ml-1" style={{ color: "#4a5568" }}>reduction</span>
        </div>
      </motion.div>

      {/* Metric cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {cardDefs.map((card) => (
          <MetricCard key={card.key} card={card} value={metrics[card.key]} />
        ))}
      </motion.div>
    </div>
  )
}