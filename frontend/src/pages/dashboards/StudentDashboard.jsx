// Student Dashboard — Educational mode with guided steps, concept explanations, glossary
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { runSimulation } from "../../api/simulationApi"
import Toast, { useToast } from "../../components/Toast"
import GrowthChart from "../../components/GrowthChart"
import { useAuth } from "../../context/AuthContext"
import { Dna, BookOpen, Play, Loader2, ChevronDown, LogOut, Settings, HelpCircle, AlertCircle, Lightbulb, CheckCircle2 } from "lucide-react"

const CONCEPTS = [
  {
    term: "Carrying Capacity (K)",
    def:  "The maximum tumor size the environment can sustain. Fixed at 10,000 cells in this model.",
    color: "#a78bfa",
  },
  {
    term: "Growth Rate (r)",
    def:  "How fast the tumor doubles. Higher r = faster unchecked growth. Typical values: 0.1–0.4.",
    color: "#f59e0b",
  },
  {
    term: "Chemo Strength (c)",
    def:  "Rate of cell kill per cycle. When c > r, the tumor cannot sustain growth and shrinks.",
    color: "#10b981",
  },
  {
    term: "Logistic Growth",
    def:  "Growth that slows as the population reaches carrying capacity. Modeled by dN/dt = rN(1 – N/K).",
    color: "#3b82f6",
  },
]

const STEPS = [
  { n: 1, title: "Set tumor size",    tip: "Start small (50–100 cells) to see growth from early stage." },
  { n: 2, title: "Choose growth rate",tip: "Try r = 0.2 first. Increase to see how quickly tumors can grow." },
  { n: 3, title: "Add chemotherapy",  tip: "Set c > r to eradicate the tumor. e.g. r=0.2, c=0.3." },
  { n: 4, title: "Run & observe",     tip: "Watch the curve. Does the tumor shrink, stabilize, or grow?" },
]

function ProfileBar() {
  const { user, resetRole, logout } = useAuth()
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: "rgba(30,42,58,0.5)", border: "1px solid rgba(30,42,58,0.8)" }}>
        {user?.photoURL && <img src={user.photoURL} className="w-6 h-6 rounded-full" alt="" />}
        <span className="text-xs text-white font-medium">{user?.displayName?.split(" ")[0]}</span>
        <ChevronDown size={12} style={{ color: "#4a5568" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 top-full mt-2 w-44 rounded-2xl overflow-hidden z-50"
            style={{ background: "rgba(10,15,30,0.97)", border: "1px solid rgba(30,42,58,0.9)", boxShadow: "0 16px 48px rgba(0,0,0,0.7)" }}>
            <div className="p-2 space-y-1">
              <button onClick={() => { resetRole(); setOpen(false) }} className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-left"
                style={{ color: "#8892a4" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(30,42,58,0.6)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <Settings size={13} /> Switch Role
              </button>
              <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-left"
                style={{ color: "#f87171" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.1)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function StudentDashboard() {
  const [initialSize,  setIS  ] = useState(50)
  const [growthRate,   setGR  ] = useState(0.2)
  const [chemoStr,     setCS  ] = useState(0.0)
  const [days,         setD   ] = useState(100)
  const [result,       setResult   ] = useState(null)
  const [isLoading,    setIsLoading] = useState(false)
  const [error,        setError    ] = useState(null)
  const [currentStep,  setStep     ] = useState(0)
  const [showGlossary, setGlossary ] = useState(false)
  const { toasts, addToast, removeToast } = useToast()
  const resultsRef = useRef(null)

  async function handleRun() {
    setIsLoading(true); setError(null)
    try {
      const data = await runSimulation({ initial_size: initialSize, growth_rate: growthRate, carrying_capacity: 10000, chemo_strength: chemoStr, days })
      setResult(data); setStep(4); addToast("Great job! Check the results below 🎓", "success")
      // Auto-scroll to results after a short delay so the DOM can render first
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120)
    } catch { setError("Backend unavailable. Make sure FastAPI is running.") }
    finally { setIsLoading(false) }
  }

  // outcome is ALWAYS defined when result exists — catch-all handles negative reduction
  const outcome = result
    ? result.metrics.reduction_percent >= 90
      ? { label: "Eradicated! 🎉", color: "#10b981", tip: "The chemo strength exceeded the growth rate — the tumor couldn't survive." }
      : result.metrics.reduction_percent >= 50
      ? { label: "Controlled ✓",   color: "#3b82f6", tip: "Good reduction! Try increasing chemo strength a bit more to fully eradicate it." }
      : result.metrics.reduction_percent >= 0
      ? { label: "Still Growing ⚠️", color: "#f59e0b", tip: "The tumor grew. Try setting chemo strength higher than the growth rate." }
      : { label: "Rapidly Growing 🔴", color: "#ef4444", tip: "No chemo or too weak — the tumor expanded. Set c > r to fight back." }
    : null

  return (
    <div className="min-h-screen" style={{ background: "#06080f", fontFamily: "'Inter', sans-serif" }}>
      {/* Top nav */}
      <div className="border-b px-8 py-4 flex items-center gap-4 sticky top-0 z-40"
        style={{ borderColor: "rgba(30,42,58,0.8)", background: "rgba(10,15,30,0.95)", backdropFilter: "blur(12px)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #10b981, #047857)", boxShadow: "0 0 14px rgba(16,185,129,0.4)" }}>
          <Dna size={16} className="text-white" />
        </div>
        <span className="text-sm font-bold text-white">OncoSim Learn</span>
        <span className="text-xs px-2 py-0.5 rounded-full ml-1" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" }}>🎓 Student</span>
        <button onClick={() => setGlossary(!showGlossary)}
          className="ml-4 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-all"
          style={{ background: showGlossary ? "rgba(167,139,250,0.15)" : "transparent", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa" }}>
          <BookOpen size={13} /> Glossary
        </button>
        <div className="ml-auto"><ProfileBar /></div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-10 space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Learn Tumor Dynamics 🧫</h1>
          <p className="text-sm" style={{ color: "#8892a4" }}>
            Follow the guided steps below. Adjust parameters and see how cancer cells grow — and how chemotherapy fights back.
          </p>
        </div>

        {/* Glossary panel */}
        <AnimatePresence>
          {showGlossary && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl p-5 overflow-hidden"
              style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#a78bfa" }}>Glossary</p>
              <div className="space-y-3">
                {CONCEPTS.map(c => (
                  <div key={c.term} className="flex gap-3">
                    <div className="w-1.5 rounded-full shrink-0 mt-1" style={{ background: c.color, height: 16 }} />
                    <div>
                      <p className="text-xs font-semibold text-white">{c.term}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#8892a4" }}>{c.def}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step-by-step guide */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STEPS.map((s, i) => (
            <div key={s.n} className="rounded-xl p-3" style={{ background: currentStep >= i ? "rgba(16,185,129,0.1)" : "rgba(15,20,32,0.6)", border: `1px solid ${currentStep >= i ? "rgba(16,185,129,0.25)" : "rgba(30,42,58,0.6)"}` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: currentStep >= i ? "#10b981" : "#1e2a3a", color: "white" }}>
                  {currentStep > i ? <CheckCircle2 size={12} /> : s.n}
                </div>
                <span className="text-xs font-semibold text-white">{s.title}</span>
              </div>
              <p className="text-[10px]" style={{ color: "#4a5568" }}>{s.tip}</p>
            </div>
          ))}
        </div>

        {/* Sim controls */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 space-y-5"
          style={{ background: "rgba(19,25,40,0.8)", border: "1px solid rgba(30,42,58,0.8)" }}>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <HelpCircle size={14} style={{ color: "#10b981" }} /> Adjust Parameters
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {[
              { label: "Initial Tumor Size",  val: initialSize, set: setIS, min: 10, max: 500, step: 10, unit: "cells", onChange: () => setStep(Math.max(currentStep, 1)) },
              { label: "Growth Rate (r)",     val: growthRate,  set: setGR, min: 0.01, max: 0.5, step: 0.01, onChange: () => setStep(Math.max(currentStep, 2)) },
              { label: "Chemo Strength (c)",  val: chemoStr,    set: setCS, min: 0, max: 0.5, step: 0.01, onChange: () => setStep(Math.max(currentStep, 3)) },
              { label: "Simulation Days",     val: days,        set: setD,  min: 10, max: 300, step: 10, unit: "days" },
            ].map((f) => (
              <div key={f.label} className="space-y-1">
                <label className="text-xs font-medium" style={{ color: "#a0aec0" }}>{f.label}</label>
                <input type="number" min={f.min} max={f.max} step={f.step} value={f.val}
                  onChange={e => { f.set(Number(e.target.value)); f.onChange?.() }}
                  className="w-full px-3 py-2 rounded-xl text-sm font-mono text-white outline-none"
                  style={{ background: "rgba(8,11,18,0.8)", border: "1px solid rgba(30,42,58,0.8)" }}
                  onFocus={e => e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"}
                  onBlur={e  => e.currentTarget.style.borderColor = "rgba(30,42,58,0.8)"} />
              </div>
            ))}
          </div>

          {/* Hint */}
          <div className="flex items-start gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <Lightbulb size={13} style={{ color: "#10b981", flexShrink: 0, marginTop: 2 }} />
            <p className="text-xs" style={{ color: "#8892a4" }}>
              <span style={{ color: "#10b981" }}>Tip:</span> To eradicate the tumor, set chemo strength (c) higher than growth rate (r).
              Try r = 0.2 and c = 0.3!
            </p>
          </div>

          <motion.button onClick={handleRun} disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white"
            style={{ background: isLoading ? "rgba(16,185,129,0.2)" : "linear-gradient(135deg, #10b981, #047857)", border: "1px solid rgba(16,185,129,0.35)" }}>
            {isLoading ? <><Loader2 size={15} className="animate-spin" />Running…</> : <><Play size={15} fill="currentColor" />Run Simulation</>}
          </motion.button>
        </motion.div>

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

        {/* Results — always render when result exists, outcome is always defined */}
        <div ref={resultsRef} />
        <AnimatePresence>
          {result && outcome && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Outcome card */}
              <div className="rounded-2xl p-5" style={{ background: `${outcome.color}11`, border: `1px solid ${outcome.color}33` }}>
                <p className="text-lg font-bold" style={{ color: outcome.color }}>{outcome.label}</p>
                <p className="text-sm mt-1" style={{ color: "#8892a4" }}>{outcome.tip}</p>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    { label: "Peak", val: `${result.metrics.peak_size.toFixed(0)} cells` },
                    { label: "Final", val: `${result.metrics.final_size.toFixed(0)} cells` },
                    { label: "Reduced by", val: `${result.metrics.reduction_percent.toFixed(1)}%` },
                  ].map(m => (
                    <div key={m.label} className="rounded-xl p-3 text-center" style={{ background: "rgba(8,11,18,0.6)", border: "1px solid rgba(30,42,58,0.8)" }}>
                      <p className="text-xs mb-0.5" style={{ color: "#4a5568" }}>{m.label}</p>
                      <p className="text-lg font-bold font-mono" style={{ color: outcome.color }}>{m.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              <GrowthChart data={result} />

              {/* Explanation */}
              <div className="rounded-xl p-4" style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)" }}>
                <p className="text-xs font-semibold mb-2" style={{ color: "#a78bfa" }}>📚 What just happened?</p>
                <p className="text-xs leading-relaxed" style={{ color: "#8892a4" }}>
                  You ran a <strong className="text-white">logistic growth model</strong> with r={growthRate} and c={chemoStr} over {days} days.
                  The equation <code className="text-white font-mono">dN/dt = rN(1 – N/K) – cN</code> governed how many cells divided vs. were killed each day.
                  {chemoStr > growthRate
                    ? " Since c > r, the kill rate beat the birth rate, driving the tumor to near zero."
                    : " Since c ≤ r, cells were born faster than killed — try increasing c!"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  )
}
