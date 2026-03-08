// Clinician Dashboard — Outcome-focused, two-panel layout
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { runSimulation } from "../../api/simulationApi"
import Toast, { useToast } from "../../components/Toast"
import MetricsPanel from "../../components/MetricsPanel"
import QuickSummaryCard from "../../components/QuickSummaryCard"
import GrowthChart from "../../components/GrowthChart"
import { useAuth } from "../../context/AuthContext"
import {
  Dna, Activity, ChevronDown, LogOut, Settings,
  Play, Loader2, AlertCircle, Download, RotateCcw, SlidersHorizontal,
} from "lucide-react"

function exportToCSV(result) {
  const rows = ["Day,Tumor Size (cells)", ...result.curve.map((v, i) => `${i},${v.toFixed(4)}`),
    "", "Metric,Value",
    `Peak Size,${result.metrics.peak_size.toFixed(2)}`,
    `Final Size,${result.metrics.final_size.toFixed(2)}`,
    `Reduction (%),${result.metrics.reduction_percent.toFixed(2)}`]
  const blob = new Blob([rows.join("\n")], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  Object.assign(document.createElement("a"), { href: url, download: `oncosim_clinical_${Date.now()}.csv` }).click()
  URL.revokeObjectURL(url)
}

function ProfileBar() {
  const { user, resetRole, logout } = useAuth()
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: "rgba(30,42,58,0.5)", border: "1px solid rgba(30,42,58,0.8)" }}>
        {user?.photoURL
          ? <img src={user.photoURL} className="w-6 h-6 rounded-full" alt="" />
          : <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg, #3b82f6, #1e40af)" }}>
              {user?.email?.[0]?.toUpperCase() ?? "?"}
            </div>
        }
        <span className="text-xs text-white font-medium hidden sm:block">
          {user?.user_metadata?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "User"}
        </span>
        <ChevronDown size={12} style={{ color: "#4a5568" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-full mt-2 w-48 rounded-2xl overflow-hidden z-50"
            style={{ background: "rgba(10,15,30,0.97)", border: "1px solid rgba(30,42,58,0.9)", boxShadow: "0 16px 48px rgba(0,0,0,0.7)" }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(30,42,58,0.8)" }}>
              <p className="text-xs text-white font-medium truncate">{user?.email}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "#4a5568" }}>Clinician account</p>
            </div>
            <div className="p-2 space-y-1">
              <button onClick={() => { resetRole(); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-left"
                style={{ color: "#8892a4" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(30,42,58,0.6)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <Settings size={13} /> Switch Role
              </button>
              <button onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-left"
                style={{ color: "#f87171" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Slider-based parameter control
function ParamSlider({ label, value, min, max, step, onChange, unit }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-xs font-medium" style={{ color: "#a0aec0" }}>{label}</label>
        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
          style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#60a5fa" }}>
          {typeof value === "number" && value % 1 !== 0 ? value.toFixed(2) : value}
          {unit && <span className="ml-1 text-[10px]" style={{ color: "#4a5568" }}>{unit}</span>}
        </span>
      </div>
      <div className="relative h-1.5">
        <div className="w-full h-full rounded-full" style={{ background: "#1e2a3a" }} />
        <div className="absolute top-0 left-0 h-full rounded-full"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg, #1e40af, #3b82f6)" }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer" style={{ height: "100%" }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full pointer-events-none"
          style={{ left: `calc(${pct}% - 7px)`, background: "#3b82f6", border: "2px solid #60a5fa", boxShadow: "0 0 8px rgba(59,130,246,0.6)" }} />
      </div>
    </div>
  )
}

export default function ClinicianDashboard() {
  const [initialSize,  setIS      ] = useState(100)
  const [growthRate,   setGR      ] = useState(0.2)
  const [chemoStr,     setCS      ] = useState(0.2)
  const [days,         setD       ] = useState(100)
  const [result,       setResult  ] = useState(null)
  const [lastParams,   setLastParams] = useState(null)
  const [isLoading,    setIsLoading] = useState(false)
  const [error,        setError   ] = useState(null)
  const resultsRef = useRef(null)
  const { toasts, addToast, removeToast } = useToast()

  async function handleRun() {
    const params = { initial_size: initialSize, growth_rate: growthRate, carrying_capacity: 10000, chemo_strength: chemoStr, days }
    setIsLoading(true); setError(null)
    try {
      const data = await runSimulation(params)
      setResult(data); setLastParams(params)
      addToast("Assessment complete ✓", "success")
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120)
    } catch {
      setError("Backend unavailable. Ensure FastAPI is running at http://127.0.0.1:8000")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#06080f", fontFamily: "'Inter', sans-serif" }}>

      {/* Top nav — full width */}
      <div className="px-8 py-4 flex items-center gap-4 sticky top-0 z-40"
        style={{ borderBottom: "1px solid rgba(30,42,58,0.8)", background: "rgba(10,15,30,0.95)", backdropFilter: "blur(12px)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #3b82f6, #1e40af)", boxShadow: "0 0 16px rgba(59,130,246,0.4)" }}>
          <Dna size={16} className="text-white" />
        </div>
        <span className="text-sm font-bold text-white">OncoSim Clinical</span>
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", color: "#60a5fa" }}>
          🩺 Clinician
        </span>
        <div className="ml-auto"><ProfileBar /></div>
      </div>

      {/* Two-panel layout */}
      <div className="flex h-[calc(100vh-57px)]">

        {/* LEFT PANEL — controls (fixed sidebar) */}
        <aside className="w-80 shrink-0 flex flex-col overflow-y-auto"
          style={{ borderRight: "1px solid rgba(30,42,58,0.8)", background: "rgba(10,14,24,0.6)" }}>
          <div className="p-6 space-y-6 flex-1">

            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <SlidersHorizontal size={14} style={{ color: "#3b82f6" }} />
                <h2 className="text-sm font-semibold text-white">Patient Parameters</h2>
              </div>
              <p className="text-xs" style={{ color: "#4a5568" }}>Adjust and run the tumor growth assessment</p>
            </div>

            <div className="h-px" style={{ background: "rgba(30,42,58,0.8)" }} />

            {/* Sliders */}
            <div className="space-y-5">
              <ParamSlider label="Initial Tumor Size" value={initialSize} min={10} max={500} step={10} onChange={setIS} unit="cells" />
              <ParamSlider label="Growth Rate (r)"    value={growthRate}  min={0.01} max={0.5} step={0.01} onChange={setGR} />
              <ParamSlider label="Chemo Strength (c)" value={chemoStr}    min={0} max={0.5} step={0.01} onChange={setCS} />
              <ParamSlider label="Duration"           value={days}        min={10} max={300} step={10}  onChange={setD} unit="days" />
            </div>

            {/* c vs r hint */}
            <div className="rounded-xl px-4 py-3 text-xs space-y-1"
              style={{ background: chemoStr > growthRate ? "rgba(16,185,129,0.08)" : "rgba(248,113,113,0.06)", border: `1px solid ${chemoStr > growthRate ? "rgba(16,185,129,0.2)" : "rgba(248,113,113,0.15)"}` }}>
              <p className="font-semibold" style={{ color: chemoStr > growthRate ? "#34d399" : "#fca5a5" }}>
                {chemoStr > growthRate ? "✓ c > r — Treatment is winning" : "⚠ c ≤ r — Tumor may grow"}
              </p>
              <p style={{ color: "#4a5568" }}>c = {chemoStr.toFixed(2)}   r = {growthRate.toFixed(2)}</p>
            </div>

            <div className="h-px" style={{ background: "rgba(30,42,58,0.8)" }} />

            {/* Run button */}
            <motion.button onClick={handleRun} disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02, boxShadow: isLoading ? undefined : "0 0 20px rgba(59,130,246,0.4)" }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white"
              style={{
                background: isLoading ? "rgba(59,130,246,0.2)" : "linear-gradient(135deg, #3b82f6, #1e40af)",
                border: "1px solid rgba(59,130,246,0.35)",
              }}>
              {isLoading ? <><Loader2 size={15} className="animate-spin" />Running…</> : <><Play size={15} fill="currentColor" />Run Assessment</>}
            </motion.button>

            {result && (
              <button onClick={() => { setResult(null); setLastParams(null) }}
                className="w-full py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs"
                style={{ color: "#4a5568", border: "1px solid rgba(30,42,58,0.6)" }}
                onMouseEnter={e => e.currentTarget.style.color = "#8892a4"}
                onMouseLeave={e => e.currentTarget.style.color = "#4a5568"}>
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
        </aside>

        {/* RIGHT PANEL — results (scrollable) */}
        <main className="flex-1 overflow-y-auto px-8 py-8 space-y-6">

          {/* Page title */}
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Clinical Assessment</h1>
            <p className="text-sm" style={{ color: "#8892a4" }}>Outcome-focused tumor growth simulation for treatment planning.</p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
                style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#fca5a5" }}>
                <AlertCircle size={14} className="shrink-0" />{error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!result && !isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", animation: "pulse 3s ease-in-out infinite" }}>
                <Activity size={32} style={{ color: "#3b82f6" }} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ready for Assessment</h3>
              <p className="text-sm max-w-sm" style={{ color: "#4a5568" }}>
                Set the patient parameters on the left, then click <span style={{ color: "#3b82f6" }}>Run Assessment</span> to view the outcome.
              </p>
            </motion.div>
          )}

          {/* Results */}
          <div ref={resultsRef} />
          <AnimatePresence>
            {result && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                {/* Export button */}
                <div className="flex justify-end">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => { exportToCSV(result); addToast("Report exported ✓", "export") }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}>
                    <Download size={13} /> Export Report
                  </motion.button>
                </div>

                {/* Metrics row */}
                <MetricsPanel metrics={result.metrics} />

                {/* Chart */}
                <GrowthChart data={result} />

                {/* AI Summary — full width below chart */}
                <QuickSummaryCard metrics={result.metrics} params={lastParams} />

              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
