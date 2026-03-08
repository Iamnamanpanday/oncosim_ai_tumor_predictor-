import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Play, Loader2, SlidersHorizontal } from "lucide-react"

function SliderControl({ label, unit, value, min, max, step = 1, onChange }) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium" style={{ color: "#a0aec0" }}>{label}</label>
        <motion.span
          key={value}
          initial={{ scale: 1.2, color: "var(--accent-light)" }}
          animate={{ scale: 1, color: "#e8edf5" }}
          className="text-sm font-mono font-semibold px-2 py-0.5 rounded"
          style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-border)" }}
        >
          {typeof value === "number" && value % 1 !== 0 ? value.toFixed(2) : value}
          {unit && <span className="text-xs ml-1" style={{ color: "#4a5568" }}>{unit}</span>}
        </motion.span>
      </div>
      <div className="relative">
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "#1e2a3a" }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, var(--accent-dark), var(--accent))",
            }}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-1.5"
          style={{ zIndex: 10 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 pointer-events-none"
          style={{
            left: `calc(${pct}% - 8px)`,
            background: "var(--accent)",
            borderColor: "var(--accent-light)",
            boxShadow: "0 0 10px var(--accent-glow)",
          }}
        />
      </div>
      <div className="flex justify-between text-xs" style={{ color: "#4a5568" }}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

export default function ControlPanel({ onRun, isLoading }) {
  const [initialSize,   setInitialSize  ] = useState(100)
  const [growthRate,    setGrowthRate   ] = useState(0.2)
  const [chemoStrength, setChemoStrength] = useState(0.2)
  const [days,          setDays         ] = useState(100)

  const runRef = useRef(null)

  function handleRun() {
    onRun({
      initial_size:      initialSize,
      growth_rate:       growthRate,
      carrying_capacity: 10000,
      chemo_strength:    chemoStrength,
      days:              days,
    })
  }

  runRef.current = handleRun

  useEffect(() => {
    const handler = () => { if (runRef.current) runRef.current() }
    window.addEventListener("oncosim:run", handler)
    return () => window.removeEventListener("oncosim:run", handler)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-6 space-y-6"
      style={{
        background: "rgba(19,25,40,0.8)",
        border: "1px solid rgba(30,42,58,0.8)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-border)" }}
        >
          <SlidersHorizontal size={16} style={{ color: "var(--accent)" }} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Simulation Controls</h2>
          <p className="text-xs" style={{ color: "#4a5568" }}>Adjust model parameters</p>
        </div>
      </div>

      <div className="h-px" style={{ background: "rgba(30,42,58,0.8)" }} />

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SliderControl label="Initial Tumor Size" unit="cells" value={initialSize}   min={10}   max={500} onChange={setInitialSize} />
        <SliderControl label="Growth Rate (r)"                 value={growthRate}    min={0.01} max={0.5} step={0.01} onChange={setGrowthRate} />
        <SliderControl label="Chemo Strength (c)"              value={chemoStrength} min={0}    max={0.5} step={0.01} onChange={setChemoStrength} />
        <SliderControl label="Simulation Days"   unit="days"  value={days}          min={10}   max={300} onChange={setDays} />
      </div>

      {/* Run button */}
      <motion.button
        onClick={handleRun}
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.02, boxShadow: isLoading ? undefined : "0 0 28px var(--accent-glow)" }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: isLoading
            ? "var(--accent-dim)"
            : "linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)",
          border: "1px solid var(--accent-border-hi)",
          letterSpacing: "0.03em",
        }}
      >
        {isLoading ? (
          <><Loader2 size={16} className="animate-spin" />Running Simulation…</>
        ) : (
          <><Play size={16} fill="currentColor" />Run Simulation</>
        )}
      </motion.button>
    </motion.div>
  )
}