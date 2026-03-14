// Researcher Dashboard — Full feature set, no restrictions
// This is essentially the same as the existing Dashboard.tsx but adapted
// to receive user/role props and show a profile header

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { runSimulation } from "../../api/simulationApi"
import Sidebar from "../../components/Sidebar"
import ControlPanel from "../../components/ControlPanel"
import MetricsPanel from "../../components/MetricsPanel"
import GrowthChart from "../../components/GrowthChart"
import Tumor3DView from "../../components/Tumor3DView"
import QuickSummaryCard from "../../components/QuickSummaryCard"
import Toast, { useToast } from "../../components/Toast"
import ModelInfoPage from "../ModelInfoPage"
import ExperimentsPage from "../ExperimentsPage"
import AboutPage from "../AboutPage"
import SavedRunsPage from "../SavedRunsPage"
import { useAuth } from "../../context/AuthContext"
import {
  Activity, Zap, AlertCircle, GitCompare, BookmarkPlus,
  Download, RotateCcw, ChevronDown, LogOut, Settings,
} from "lucide-react"

function exportToCSV(result, params) {
  const rows = [
    "Day,Tumor Size (cells)",
    ...result.curve.map((v, i) => `${i},${v.toFixed(4)}`),
    "", "Metric,Value",
    `Peak Size,${result.metrics.peak_size.toFixed(2)}`,
    `Final Size,${result.metrics.final_size.toFixed(2)}`,
    `Reduction (%),${result.metrics.reduction_percent.toFixed(2)}`,
  ]
  const blob = new Blob([rows.join("\n")], { type: "text/csv" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href = url; a.download = `oncosim_researcher_${Date.now()}.csv`; a.click()
  URL.revokeObjectURL(url)
}

const LS_KEY = "oncosim_saved_runs"
function loadRuns() { try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") } catch { return [] } }
function persistRuns(r) { localStorage.setItem(LS_KEY, JSON.stringify(r)) }

function useTypewriter(text, speed = 20) {
  const [d, setD] = useState("")
  useEffect(() => {
    setD(""); let i = 0
    const id = setInterval(() => { i++; setD(text.slice(0, i)); if (i >= text.length) clearInterval(id) }, speed)
    return () => clearInterval(id)
  }, [text, speed])
  return d
}

function SectionLabel({ icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span style={{ color: "var(--accent)" }}>{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4a5568" }}>{label}</span>
      <div className="flex-1 h-px ml-2" style={{ background: "rgba(30,42,58,0.8)" }} />
    </div>
  )
}

// Profile dropdown
function ProfileMenu() {
  const { user, resetRole, logout } = useAuth()
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
        style={{ background: "rgba(30,42,58,0.5)", border: "1px solid rgba(30,42,58,0.8)" }}
      >
        {user?.photoURL && <img src={user.photoURL} className="w-6 h-6 rounded-full" alt="avatar" />}
        <span className="text-xs text-white font-medium">{user?.displayName?.split(" ")[0]}</span>
        <ChevronDown size={12} style={{ color: "#4a5568" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-full mt-2 w-48 rounded-2xl overflow-hidden z-50"
            style={{ background: "rgba(10,15,30,0.97)", border: "1px solid rgba(30,42,58,0.9)", boxShadow: "0 16px 48px rgba(0,0,0,0.7)" }}
          >
            <div className="p-2 space-y-1">
              <p className="px-3 py-1.5 text-xs" style={{ color: "#4a5568" }}>{user?.email}</p>
              <button onClick={() => { resetRole(); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition-all text-left"
                style={{ color: "#8892a4" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(30,42,58,0.6)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <Settings size={13} /> Switch Role
              </button>
              <button onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl transition-all text-left"
                style={{ color: "var(--accent-light)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--accent-soft)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ResearcherDashboard() {
  const { user } = useAuth()
  const [result,        setResult      ] = useState(null)
  const [lastParams,    setLastParams  ] = useState(null)
  const [compareResult, setCompareResult] = useState(null)
  const [isLoading,     setIsLoading   ] = useState(false)
  const [error,         setError       ] = useState(null)
  const [activeNav,     setActiveNav   ] = useState("simulator")
  const [compareMode,   setCompareMode ] = useState(false)
  const [savedRuns,     setSavedRuns   ] = useState(loadRuns)
  const { toasts, addToast, removeToast } = useToast()
  const typedSub = useTypewriter("Full-featured simulation suite with compare mode, exports, and advanced analytics.")

  useEffect(() => {
    const handler = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && activeNav === "simulator" && !isLoading) window.dispatchEvent(new CustomEvent("oncosim:run")) }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [activeNav, isLoading])

  async function handleRunSimulation(params) {
    setIsLoading(true); setError(null)
    try {
      const data = await runSimulation(params)
      if (compareMode && result) { setCompareResult(data); addToast("Compare run complete ✓", "success") }
      else { setResult(data); setCompareResult(null); setLastParams(params); addToast("Simulation complete ✓", "success") }
    } catch { setError("Simulation failed. Make sure the backend is running at http://127.0.0.1:8000") }
    finally { setIsLoading(false) }
  }

  function handleSaveRun() {
    if (!user) {
      addToast("Sign in to save your data", "error")
      return
    }
    if (!result || !lastParams) return
    const run = { id: `run-${Date.now()}`, timestamp: new Date().toLocaleString(), params: lastParams, metrics: result.metrics, curve: result.curve }
    const updated = [run, ...savedRuns]; setSavedRuns(updated); persistRuns(updated)
    addToast("Run saved ✓", "success")
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} runsCount={savedRuns.length} />
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-10 space-y-8">

          {/* Profile bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}>
              🔬 Researcher Mode
            </span>
            <ProfileMenu />
          </div>

          {activeNav === "model-info"  && <ModelInfoPage />}
          {activeNav === "experiments" && <ExperimentsPage />}
          {activeNav === "about"       && <AboutPage />}
          {activeNav === "history"     && <SavedRunsPage runs={savedRuns} onDelete={(id) => { const u = savedRuns.filter(r => r.id !== id); setSavedRuns(u); persistRuns(u) }} onClearAll={() => { setSavedRuns([]); persistRuns([]) }} />}

          {activeNav === "simulator" && (<>
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="space-y-2 relative rounded-3xl"
              style={{ padding: "28px 32px", background: "rgba(13,17,28,0.7)", border: "1px solid rgba(30,42,58,0.5)" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest" style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}>
                  ○ Live Simulation
                </span>
                <span className="text-xs px-2 py-1 rounded-lg font-mono ml-auto" style={{ background: "rgba(30,42,58,0.6)", border: "1px solid rgba(30,42,58,0.8)", color: "#4a5568" }}>⌘ / Ctrl + Enter to run</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight" style={{ background: "var(--hero-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                OncoSim — Researcher
              </h1>
              <p className="text-base max-w-2xl" style={{ color: "#8892a4", minHeight: 40 }}>{typedSub}</p>
            </motion.div>

            <div className="h-px" style={{ background: "linear-gradient(90deg, var(--accent-glow) 0%, rgba(30,42,58,0.5) 60%, transparent 100%)" }} />

            {/* Compare toggle */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setCompareMode(!compareMode); if (compareMode) setCompareResult(null) }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: compareMode ? "rgba(59,130,246,0.15)" : "rgba(15,20,32,0.7)", border: compareMode ? "1px solid rgba(59,130,246,0.3)" : "1px solid var(--accent-border)", color: compareMode ? "#60a5fa" : "#8892a4" }}
            >
              <GitCompare size={14} />
              {compareMode ? "Compare Mode ON — Run B" : "Enable Compare Mode"}
            </motion.button>

            <section><SectionLabel icon={<Zap size={14} />} label="Control Panel" /><ControlPanel onRun={handleRunSimulation} isLoading={isLoading} /></section>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-3 rounded-xl px-5 py-4"
                  style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-border-hi)", color: "var(--accent-light)" }}>
                  <AlertCircle size={16} className="mt-0.5 shrink-0" /><p className="text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                  {/* Action bar */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSaveRun}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8" }}>
                      <BookmarkPlus size={14} /> Save Run
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { exportToCSV(result, lastParams); addToast("CSV exported ✓", "export") }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" }}>
                      <Download size={14} /> Export CSV
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { setResult(null); setCompareResult(null); setLastParams(null) }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold ml-auto"
                      style={{ background: "rgba(15,20,32,0.6)", border: "1px solid rgba(30,42,58,0.8)", color: "#4a5568" }}>
                      <RotateCcw size={13} /> Reset
                    </motion.button>
                  </div>
                  <section><SectionLabel icon={<Activity size={14} />} label="Simulation Metrics" /><MetricsPanel metrics={result.metrics} /></section>
                  <section><SectionLabel icon={<Activity size={14} />} label="AI Summary" /><QuickSummaryCard metrics={result.metrics} params={lastParams} /></section>
                  <section>
                    <SectionLabel icon={<Activity size={14} />} label="Visualization" />
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <GrowthChart data={result} compareData={compareResult} />
                      <Tumor3DView data={result} />
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>

            {!result && !isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-border)", animation: "pulse 3s ease-in-out infinite" }}>
                  <Activity size={32} style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Ready to Simulate</h3>
                <p className="text-sm max-w-sm" style={{ color: "#4a5568" }}>
                  Configure parameters above and click <span style={{ color: "var(--accent)" }}>Run Simulation</span>.
                </p>
              </motion.div>
            )}
          </>)}
        </div>
      </main>
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
