import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { runSimulation, SimulationRequest } from "../api/simulationApi"
import { FlaskConical, Play, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Plus, Settings2 } from "lucide-react"

interface ExperimentResult {
  curve: number[]
  metrics: { peak_size: number; final_size: number; reduction_percent: number }
}

interface Experiment {
  id: string
  name: string
  description: string
  scenario: string
  color: string
  glow: string
  border: string
  params: SimulationRequest
}

const presets: Experiment[] = [
  {
    id: "untreated",
    name: "Untreated Growth",
    description: "No chemotherapy applied. Observe unconstrained logistic growth toward carrying capacity.",
    scenario: "Baseline",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.15)",
    border: "rgba(245,158,11,0.25)",
    params: { initial_size: 50, growth_rate: 0.3, carrying_capacity: 10000, chemo_strength: 0, days: 150 },
  },
  {
    id: "low-chemo",
    name: "Low-Dose Chemo",
    description: "Mild chemotherapy (c=0.1). Tumor grows initially but stabilizes at a lower equilibrium.",
    scenario: "Partial Response",
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.15)",
    border: "rgba(59,130,246,0.25)",
    params: { initial_size: 100, growth_rate: 0.25, carrying_capacity: 10000, chemo_strength: 0.1, days: 200 },
  },
  {
    id: "effective-chemo",
    name: "Effective Treatment",
    description: "High-dose chemo (c=0.35) exceeds growth rate. Tumor shrinks to near-zero.",
    scenario: "Complete Response",
    color: "#10b981",
    glow: "rgba(16,185,129,0.15)",
    border: "rgba(16,185,129,0.25)",
    params: { initial_size: 200, growth_rate: 0.2, carrying_capacity: 10000, chemo_strength: 0.35, days: 120 },
  },
  {
    id: "aggressive",
    name: "Aggressive Tumor",
    description: "High growth rate (r=0.45) tumor barely contained by maximum chemo (c=0.5).",
    scenario: "Resistant Phenotype",
    color: "#dc143c",
    glow: "rgba(220,20,60,0.15)",
    border: "rgba(220,20,60,0.25)",
    params: { initial_size: 300, growth_rate: 0.45, carrying_capacity: 10000, chemo_strength: 0.5, days: 250 },
  },
]

function ExperimentCard({ exp, result, isLoading, onRun }: {
  exp: Experiment
  result: ExperimentResult | null
  isLoading: boolean
  onRun: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(19,25,40,0.8)", border: `1px solid ${exp.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: exp.glow, border: `1px solid ${exp.border}` }}>
            <FlaskConical size={18} style={{ color: exp.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full mb-1.5 inline-block"
                  style={{ background: exp.glow, border: `1px solid ${exp.border}`, color: exp.color }}>
                  {exp.scenario}
                </span>
                <h3 className="text-base font-semibold text-white">{exp.name}</h3>
              </div>
              {result && <CheckCircle2 size={18} style={{ color: "#10b981" }} />}
            </div>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "#8892a4" }}>{exp.description}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: "N₀", val: exp.params.initial_size },
            { label: "r",  val: exp.params.growth_rate },
            { label: "c",  val: exp.params.chemo_strength },
            { label: "Days", val: exp.params.days },
          ].map((p) => (
            <span key={p.label} className="text-xs font-mono px-2.5 py-1 rounded-lg"
              style={{ background: "rgba(8,11,18,0.7)", border: "1px solid rgba(30,42,58,0.8)", color: "#8892a4" }}>
              {p.label} = <span className="text-white font-semibold">{p.val}</span>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <motion.button
            onClick={onRun}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all"
            style={{
              background: isLoading ? "rgba(220,20,60,0.2)" : `linear-gradient(135deg, ${exp.color}, ${exp.color}99)`,
              border: `1px solid ${exp.border}`,
            }}
          >
            {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} fill="currentColor" />}
            {isLoading ? "Running…" : "Run Experiment"}
          </motion.button>

          {result && (
            <button onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all"
              style={{ background: "rgba(15,20,32,0.8)", border: "1px solid rgba(30,42,58,0.8)", color: "#8892a4" }}>
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              Results
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {result && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1">
              <div className="h-px mb-4" style={{ background: exp.border }} />
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Peak Size",  val: result.metrics.peak_size.toFixed(0),          unit: "cells" },
                  { label: "Final Size", val: result.metrics.final_size.toFixed(0),         unit: "cells" },
                  { label: "Reduction",  val: result.metrics.reduction_percent.toFixed(1),  unit: "%" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl p-3 text-center"
                    style={{ background: "rgba(8,11,18,0.7)", border: `1px solid ${exp.border}` }}>
                    <p className="text-xs mb-0.5" style={{ color: "#4a5568" }}>{m.label}</p>
                    <p className="text-xl font-bold font-mono" style={{ color: exp.color }}>{m.val}</p>
                    <p className="text-xs" style={{ color: "#4a5568" }}>{m.unit}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------- Custom Scenario Builder ----------
interface CustomField { label: string; key: keyof SimulationRequest; min: number; max: number; step: number; default: number }

const customFields: CustomField[] = [
  { label: "Initial Tumor Size (N₀)", key: "initial_size",   min: 10,   max: 500,  step: 10,  default: 100 },
  { label: "Growth Rate (r)",          key: "growth_rate",    min: 0.01, max: 0.5,  step: 0.01,default: 0.2 },
  { label: "Chemo Strength (c)",        key: "chemo_strength", min: 0,    max: 0.5,  step: 0.01,default: 0.2 },
  { label: "Simulation Days",           key: "days",           min: 10,   max: 300,  step: 10,  default: 100 },
]

function NumberInput({ field, value, onChange }: { field: CustomField; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium" style={{ color: "#8892a4" }}>{field.label}</label>
      <input
        type="number"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-3 py-2 rounded-xl text-sm font-mono text-white outline-none transition-all"
        style={{
          background: "rgba(8,11,18,0.8)",
          border: "1px solid rgba(30,42,58,0.8)",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(220,20,60,0.5)")}
        onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(30,42,58,0.8)")}
      />
    </div>
  )
}

function CustomScenarioBuilder({ onAddResult }: { onAddResult: (exp: Experiment, result: ExperimentResult) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("My Custom Scenario")
  const [vals, setVals] = useState<Record<string, number>>(
    Object.fromEntries(customFields.map((f) => [f.key, f.default]))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRun() {
    setLoading(true)
    setError(null)
    const params: SimulationRequest = {
      initial_size:       vals.initial_size,
      growth_rate:        vals.growth_rate,
      carrying_capacity:  10000,
      chemo_strength:     vals.chemo_strength,
      days:               vals.days,
    }
    try {
      const data = await runSimulation(params)
      const customExp: Experiment = {
        id: `custom-${Date.now()}`,
        name,
        description: `Custom scenario — r=${vals.growth_rate}, c=${vals.chemo_strength}, ${vals.days} days.`,
        scenario: "Custom",
        color: "#a78bfa",
        glow: "rgba(167,139,250,0.15)",
        border: "rgba(167,139,250,0.25)",
        params,
      }
      onAddResult(customExp, data)
      setOpen(false)
    } catch {
      setError("Simulation failed. Make sure the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(19,25,40,0.8)",
        border: "1px solid rgba(167,139,250,0.25)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.25)" }}
        >
          <Settings2 size={18} style={{ color: "#a78bfa" }} />
        </div>
        <div className="flex-1">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full mb-1.5 inline-block"
            style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.25)", color: "#a78bfa" }}
          >
            Custom
          </span>
          <h3 className="text-base font-semibold text-white">Build Your Own Scenario</h3>
          <p className="text-xs mt-0.5" style={{ color: "#8892a4" }}>
            Define any parameter combination and run your own experiment.
          </p>
        </div>
        <Plus
          size={18}
          style={{
            color: "#a78bfa",
            transform: open ? "rotate(45deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              <div className="h-px" style={{ background: "rgba(167,139,250,0.2)" }} />

              {/* Scenario name */}
              <div className="space-y-1">
                <label className="text-xs font-medium" style={{ color: "#8892a4" }}>Scenario Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                  style={{ background: "rgba(8,11,18,0.8)", border: "1px solid rgba(30,42,58,0.8)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)")}
                  onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(30,42,58,0.8)")}
                />
              </div>

              {/* Number inputs */}
              <div className="grid grid-cols-2 gap-4">
                {customFields.map((f) => (
                  <NumberInput
                    key={f.key}
                    field={f}
                    value={vals[f.key]}
                    onChange={(v) => setVals((prev) => ({ ...prev, [f.key]: v }))}
                  />
                ))}
              </div>

              {error && (
                <p className="text-xs" style={{ color: "#ff6b80" }}>{error}</p>
              )}

              <motion.button
                onClick={handleRun}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white"
                style={{
                  background: loading
                    ? "rgba(167,139,250,0.2)"
                    : "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
                  border: "1px solid rgba(167,139,250,0.4)",
                }}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                {loading ? "Running…" : "Run Custom Scenario"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---------- Main Page ----------
export default function ExperimentsPage() {
  const [results, setResults] = useState<Record<string, ExperimentResult>>({})
  const [customExps, setCustomExps] = useState<{ exp: Experiment; result: ExperimentResult }[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function runExperiment(exp: Experiment) {
    setLoadingId(exp.id)
    setError(null)
    try {
      const data = await runSimulation(exp.params)
      setResults((prev) => ({ ...prev, [exp.id]: data }))
    } catch {
      setError("Simulation failed. Make sure the backend is running at http://127.0.0.1:8000")
    } finally {
      setLoadingId(null)
    }
  }

  function handleCustomResult(exp: Experiment, result: ExperimentResult) {
    setCustomExps((prev) => [...prev, { exp, result }])
  }

  const completedCount = Object.keys(results).length + customExps.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest"
            style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}>
            {completedCount}/{presets.length + customExps.length} Completed
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Experiments</h1>
        <p className="text-base max-w-2xl" style={{ color: "#8892a4" }}>
          Pre-configured simulation scenarios covering key clinical phenotypes — from untreated growth to complete chemotherapy response.
          Build your own below.
        </p>
      </motion.div>

      <div className="h-px" style={{ background: "linear-gradient(90deg, rgba(16,185,129,0.4) 0%, rgba(30,42,58,0.5) 60%, transparent 100%)" }} />

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-xl px-5 py-4"
            style={{ background: "rgba(220,20,60,0.1)", border: "1px solid rgba(220,20,60,0.3)", color: "#ff6b80" }}>
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preset experiment cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {presets.map((exp) => (
          <ExperimentCard
            key={exp.id}
            exp={exp}
            result={results[exp.id] ?? null}
            isLoading={loadingId === exp.id}
            onRun={() => runExperiment(exp)}
          />
        ))}
      </div>

      {/* Custom results */}
      {customExps.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#4a5568" }}>
            Custom Scenarios
          </p>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {customExps.map(({ exp, result }) => (
              <ExperimentCard
                key={exp.id}
                exp={exp}
                result={result}
                isLoading={false}
                onRun={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Custom Scenario Builder */}
      <CustomScenarioBuilder onAddResult={handleCustomResult} />

      <div className="rounded-xl px-5 py-3 text-xs flex items-center gap-3"
        style={{ background: "rgba(15,20,32,0.6)", border: "1px solid rgba(30,42,58,0.6)", color: "#4a5568" }}>
        <FlaskConical size={13} />
        Results are computed live from the FastAPI backend. Use the Simulator tab for custom parameter exploration.
      </div>
    </div>
  )
}
