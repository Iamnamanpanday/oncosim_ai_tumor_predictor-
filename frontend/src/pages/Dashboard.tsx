import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { runSimulation, SimulationRequest } from "../api/simulationApi"
import Sidebar from "../components/Sidebar"
import ControlPanel from "../components/ControlPanel"
import MetricsPanel from "../components/MetricsPanel"
import GrowthChart from "../components/GrowthChart"
import Tumor3DView from "../components/Tumor3DView"
import QuickSummaryCard from "../components/QuickSummaryCard"
import Toast, { useToast } from "../components/Toast"
import ModelInfoPage from "./ModelInfoPage"
import ExperimentsPage from "./ExperimentsPage"
import AboutPage from "./AboutPage"
import SavedRunsPage from "./SavedRunsPage"
import {
  Activity, Zap, AlertCircle, GitCompare, BookmarkPlus,
  Download, X, RotateCcw,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────
interface SimulationResult {
  curve: number[]
  metrics: { peak_size: number; final_size: number; reduction_percent: number }
}

interface SavedRun {
  id: string
  timestamp: string
  params: SimulationRequest
  metrics: SimulationResult["metrics"]
  curve: number[]
}

interface SectionLabelProps {
  icon: React.ReactNode
  label: string
}

// ─── Typewriter hook (UX touch #5) ────────────────────────────────────────────
function useTypewriter(text: string, speed = 28) {
  const [displayed, setDisplayed] = useState("")
  useEffect(() => {
    setDisplayed("")
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return displayed
}

// ─── Cursor glow (UX touch #2) ────────────────────────────────────────────────
function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      if (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top  && e.clientY <= rect.bottom
      ) {
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }
    }
    window.addEventListener("mousemove", handler)
    return () => window.removeEventListener("mousemove", handler)
  }, [])

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      <div
        style={{
          position: "absolute",
          left: pos.x - 120,
          top: pos.y - 120,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)",
          transition: "left 0.08s, top 0.08s",
          pointerEvents: "none",
        }}
      />
    </div>
  )
}

// ─── Export-to-CSV helper ─────────────────────────────────────────────────────
function exportToCSV(result: SimulationResult, params: SimulationRequest) {
  const rows: string[] = [
    "Day,Tumor Size (cells)",
    ...result.curve.map((v, i) => `${i},${v.toFixed(4)}`),
    "",
    "Metric,Value",
    `Peak Size,${result.metrics.peak_size.toFixed(2)}`,
    `Final Size,${result.metrics.final_size.toFixed(2)}`,
    `Reduction (%),${result.metrics.reduction_percent.toFixed(2)}`,
    "",
    "Parameter,Value",
    `Initial Size,${params.initial_size}`,
    `Growth Rate,${params.growth_rate}`,
    `Chemo Strength,${params.chemo_strength}`,
    `Days,${params.days}`,
  ]
  const blob = new Blob([rows.join("\n")], { type: "text/csv" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href     = url
  a.download = `oncosim_run_${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── localStorage helpers ─────────────────────────────────────────────────────
const LS_KEY = "oncosim_saved_runs"

function loadRuns(): SavedRun[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") } catch { return [] }
}
function persistRuns(runs: SavedRun[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(runs))
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [result,        setResult      ] = useState<SimulationResult | null>(null)
  const [lastParams,    setLastParams  ] = useState<SimulationRequest | null>(null)
  const [compareResult, setCompareResult] = useState<SimulationResult | null>(null)
  const [isLoading,     setIsLoading   ] = useState(false)
  const [error,         setError       ] = useState<string | null>(null)
  const [activeNav,     setActiveNav   ] = useState("simulator")
  const [compareMode,   setCompareMode ] = useState(false)
  const [savedRuns,     setSavedRuns   ] = useState<SavedRun[]>(loadRuns)
  const { toasts, addToast, removeToast } = useToast()

  const subtitleText = "Interactive computational oncology simulation using logistic tumor growth models. Adjust parameters and visualize how cancer cell populations evolve under treatment."
  const typedSubtitle = useTypewriter(subtitleText, 20)

  // ── Keyboard shortcut: Ctrl/Cmd+Enter ────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && activeNav === "simulator" && !isLoading) {
        // Trigger the existing run — ControlPanel manages its own state,
        // so we fire a custom event the ControlPanel listens for
        window.dispatchEvent(new CustomEvent("oncosim:run"))
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [activeNav, isLoading])

  // ── Run simulation ────────────────────────────────────────────────────────
  async function handleRunSimulation(params: SimulationRequest) {
    setIsLoading(true)
    setError(null)
    try {
      const data = await runSimulation(params)
      if (compareMode && result) {
        setCompareResult(data)
        addToast("Compare run complete ✓", "success")
      } else {
        setResult(data)
        setCompareResult(null)
        setLastParams(params)
        addToast("Simulation complete ✓", "success")
      }
    } catch {
      setError("Simulation failed. Make sure the backend is running at http://127.0.0.1:8000")
    } finally {
      setIsLoading(false)
    }
  }

  // ── Save run ──────────────────────────────────────────────────────────────
  function handleSaveRun() {
    if (!result || !lastParams) return
    const run: SavedRun = {
      id: `run-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      params: lastParams,
      metrics: result.metrics,
      curve: result.curve,
    }
    const updated = [run, ...savedRuns]
    setSavedRuns(updated)
    persistRuns(updated)
    addToast("Run saved to history ✓", "success")
  }

  // ── Delete run ────────────────────────────────────────────────────────────
  function handleDeleteRun(id: string) {
    const updated = savedRuns.filter((r) => r.id !== id)
    setSavedRuns(updated)
    persistRuns(updated)
  }

  function handleClearAll() {
    setSavedRuns([])
    persistRuns([])
    addToast("History cleared", "success")
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#080b12", fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} runsCount={savedRuns.length} />

      {/* Main */}
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-10 space-y-8">

          {/* Page router — non-simulator pages */}
          {activeNav === "model-info"  && <ModelInfoPage />}
          {activeNav === "experiments" && <ExperimentsPage />}
          {activeNav === "about"       && <AboutPage />}
          {activeNav === "history"     && (
            <SavedRunsPage runs={savedRuns} onDelete={handleDeleteRun} onClearAll={handleClearAll} />
          )}

          {/* ── Simulator Page ── */}
          {activeNav === "simulator" && (<>

            {/* Hero header with typewriter + cursor glow */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-2 relative rounded-3xl"
              style={{ padding: "28px 32px", background: "rgba(13,17,28,0.7)", border: "1px solid rgba(30,42,58,0.5)" }}
            >
              <CursorGlow />

              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest"
                  style={{
                    background: "var(--accent-soft)",
                    border: "1px solid var(--accent-border)",
                    color: "var(--accent)",
                  }}
                >
                  ○ Live Simulation
                </span>
                {/* Keyboard hint */}
                <span
                  className="text-xs px-2 py-1 rounded-lg font-mono ml-auto"
                  style={{ background: "rgba(30,42,58,0.6)", border: "1px solid rgba(30,42,58,0.8)", color: "#4a5568" }}
                >
                  ⌘ / Ctrl + Enter to run
                </span>
              </div>

              <h1
                className="text-4xl font-bold tracking-tight"
                style={{
                  background: "var(--hero-gradient)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                OncoSim Tumor Growth Simulator
              </h1>

              <p className="text-base max-w-2xl" style={{ color: "#8892a4", minHeight: 48 }}>
                {typedSubtitle}
                <span
                  className="inline-block w-0.5 h-4 ml-0.5 align-middle"
                  style={{
                    background: "#dc143c",
                    animation: "blink 1s step-end infinite",
                    opacity: typedSubtitle.length >= subtitleText.length ? 0 : 1,
                  }}
                />
              </p>
            </motion.div>

            {/* Divider */}
            <div
              className="h-px"
              style={{ background: "linear-gradient(90deg, var(--accent-glow) 0%, rgba(30,42,58,0.5) 60%, transparent 100%)" }}
            />

            {/* Compare mode toggle */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setCompareMode(!compareMode); if (compareMode) setCompareResult(null) }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: compareMode ? "rgba(59,130,246,0.15)" : "rgba(15,20,32,0.7)",
                  border: compareMode ? "1px solid rgba(59,130,246,0.3)" : "1px solid var(--accent-border)",
                  color: compareMode ? "#60a5fa" : "#8892a4",
                }}
              >
                <GitCompare size={14} />
                {compareMode ? "Compare Mode ON — Run B" : "Enable Compare Mode"}
              </motion.button>
              {compareMode && (
                <p className="text-xs" style={{ color: "#4a5568" }}>
                  Run A is locked. Configure new params below and run again to set Run B.
                </p>
              )}
            </div>

            {/* Control Panel */}
            <section>
              <SectionLabel icon={<Zap size={14} />} label="Control Panel" />
              <ControlPanel onRun={handleRunSimulation} isLoading={isLoading} />
            </section>

            {/* Error Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-3 rounded-xl px-5 py-4"
                  style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-border-hi)", color: "var(--accent-light)" }}
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Post-simulation sections */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  {/* Action bar: Save + Export */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSaveRun}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: "rgba(99,102,241,0.12)",
                        border: "1px solid rgba(99,102,241,0.25)",
                        color: "#818cf8",
                      }}
                    >
                      <BookmarkPlus size={14} />
                      Save Run
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        if (result && lastParams) {
                          exportToCSV(result, lastParams)
                          addToast("CSV exported ✓", "export")
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: "rgba(16,185,129,0.1)",
                        border: "1px solid rgba(16,185,129,0.25)",
                        color: "#34d399",
                      }}
                    >
                      <Download size={14} />
                      Export CSV
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setResult(null); setCompareResult(null); setLastParams(null) }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ml-auto"
                      style={{
                        background: "rgba(15,20,32,0.6)",
                        border: "1px solid rgba(30,42,58,0.8)",
                        color: "#4a5568",
                      }}
                    >
                      <RotateCcw size={13} />
                      Reset
                    </motion.button>
                  </div>

                  {/* Metrics */}
                  <section>
                    <SectionLabel icon={<Activity size={14} />} label="Simulation Metrics" />
                    <MetricsPanel metrics={result.metrics} />
                  </section>

                  {/* AI Quick Summary */}
                  <section>
                    <SectionLabel icon={<Activity size={14} />} label="AI Summary" />
                    <QuickSummaryCard metrics={result.metrics} params={lastParams} />
                  </section>

                  {/* Chart + 3D */}
                  <section>
                    <SectionLabel icon={<Activity size={14} />} label="Visualization" />
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <GrowthChart data={result} compareData={compareResult as any} />
                      <Tumor3DView data={result} />
                    </div>
                  </section>

                  {/* Data footer */}
                  <div
                    className="flex items-center justify-between rounded-xl px-5 py-3 text-xs"
                    style={{
                      background: "rgba(15,20,32,0.6)",
                      border: "1px solid rgba(30,42,58,0.6)",
                      color: "#4a5568",
                    }}
                  >
                    <span className="font-mono">{result.curve.length} data points computed</span>
                    <span>Logistic growth model · dN/dt = rN(1 – N/K) – cN</span>
                    <span className="font-mono">K = 10,000 cells</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state */}
            <AnimatePresence>
              {!result && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                    style={{
                      background: "var(--accent-soft)",
                      border: "1px solid var(--accent-border)",
                      animation: "pulse 3s ease-in-out infinite",
                    }}
                  >
                    <Activity size={32} style={{ color: "var(--accent)" }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Ready to Simulate</h3>
                  <p className="text-sm max-w-sm" style={{ color: "#4a5568" }}>
                    Configure the model parameters above and click{" "}
                    <span style={{ color: "var(--accent)" }}>Run Simulation</span> to visualize tumor growth dynamics.
                    Press <kbd className="px-1.5 py-0.5 rounded font-mono text-xs" style={{ background: "rgba(30,42,58,0.8)", border: "1px solid rgba(30,42,58,1)", color: "#8892a4" }}>Ctrl+Enter</kbd> for quick run.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </>)}
        </div>
      </main>

      {/* Toast notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Cursor blink keyframe injected once */}
      <style>{`@keyframes blink { 50% { opacity: 0 } }`}</style>
    </div>
  )
}

function SectionLabel({ icon, label }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span style={{ color: "var(--accent)" }}>{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4a5568" }}>
        {label}
      </span>
      <div className="flex-1 h-px ml-2" style={{ background: "rgba(30,42,58,0.8)" }} />
    </div>
  )
}