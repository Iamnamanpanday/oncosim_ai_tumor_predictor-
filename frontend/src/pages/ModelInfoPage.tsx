import { motion } from "framer-motion"
import { BookOpen, FlaskConical, TrendingUp, Cpu, BarChart2, Atom } from "lucide-react"

const sections = [
  {
    icon: FlaskConical,
    color: "#dc143c",
    glow: "rgba(220,20,60,0.15)",
    border: "rgba(220,20,60,0.25)",
    title: "Logistic Growth Model",
    content: `The core of OncoSim is based on the logistic tumor growth model, a classic mathematical framework that captures the S-shaped growth of biological populations. Tumor cells grow exponentially at low populations but slow as they approach carrying capacity due to resource constraints.`,
    equation: "dN/dt = rN(1 - N/K)",
    vars: [
      { sym: "N", desc: "Tumor cell population size" },
      { sym: "r", desc: "Intrinsic growth rate (proliferation rate)" },
      { sym: "K", desc: "Carrying capacity (max sustainable size)" },
    ],
  },
  {
    icon: Atom,
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.15)",
    border: "rgba(59,130,246,0.25)",
    title: "Chemotherapy Extension",
    content: `OncoSim extends the base logistic model to include a chemotherapy killing term. The drug effect is modeled as a first-order process — a fraction c of the tumor population is eliminated at each time step, representing dose-dependent cytotoxic action.`,
    equation: "dN/dt = rN(1 - N/K) - cN",
    vars: [
      { sym: "c", desc: "Chemo kill rate (drug strength parameter)" },
      { sym: "cN", desc: "Cells killed per unit time by chemotherapy" },
    ],
  },
  {
    icon: Cpu,
    color: "#10b981",
    glow: "rgba(16,185,129,0.15)",
    border: "rgba(16,185,129,0.25)",
    title: "Numerical Integration",
    content: `The ODE is solved using discrete Euler integration with a time step of 1 day. At each step, the tumor size is updated using the differential equation. Values are clamped to zero to prevent negative cell counts from extreme chemo values.`,
    equation: "N(t+1) = N(t) + Δt · f(N(t))",
    vars: [
      { sym: "Δt", desc: "Time step = 1 day" },
      { sym: "f(N)", desc: "Net growth rate = rN(1-N/K) - cN" },
    ],
  },
]

const assumptions = [
  "Homogeneous tumor population — all cells behave identically",
  "No drug pharmacokinetics — constant chemo concentration assumed",
  "Single-compartment model — no spatial heterogeneity",
  "No immune system interaction modeled",
  "Carrying capacity K is fixed at 10,000 cells",
]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.45 } }),
}

export default function ModelInfoPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest"
            style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", color: "#3b82f6" }}>
            Mathematical Model
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Model Information</h1>
        <p className="text-base max-w-2xl" style={{ color: "#8892a4" }}>
          Mathematical foundations of the logistic tumor growth model with chemotherapy dynamics used in OncoSim.
        </p>
      </motion.div>

      <div className="h-px" style={{ background: "linear-gradient(90deg, rgba(59,130,246,0.4) 0%, rgba(30,42,58,0.5) 60%, transparent 100%)" }} />

      {/* Model sections */}
      <div className="space-y-5">
        {sections.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.title}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="rounded-2xl p-6"
              style={{ background: "rgba(19,25,40,0.8)", border: `1px solid ${s.border}`, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: s.glow, border: `1px solid ${s.border}` }}>
                  <Icon size={18} style={{ color: s.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-white mb-2">{s.title}</h2>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "#8892a4" }}>{s.content}</p>

                  {/* Equation */}
                  <div className="rounded-xl px-5 py-4 mb-4 inline-block"
                    style={{ background: "rgba(8,11,18,0.8)", border: `1px solid ${s.border}` }}>
                    <p className="font-mono text-lg font-semibold" style={{ color: s.color }}>{s.equation}</p>
                  </div>

                  {/* Variables */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {s.vars.map((v) => (
                      <div key={v.sym} className="flex items-start gap-3 rounded-lg px-3 py-2"
                        style={{ background: "rgba(8,11,18,0.5)", border: "1px solid rgba(30,42,58,0.6)" }}>
                        <span className="font-mono text-sm font-bold shrink-0" style={{ color: s.color }}>{v.sym}</span>
                        <span className="text-xs" style={{ color: "#8892a4" }}>{v.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Assumptions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl p-6"
        style={{ background: "rgba(19,25,40,0.8)", border: "1px solid rgba(245,158,11,0.25)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}>
            <BookOpen size={16} style={{ color: "#f59e0b" }} />
          </div>
          <h2 className="text-base font-semibold text-white">Model Assumptions</h2>
        </div>
        <ul className="space-y-2.5">
          {assumptions.map((a, i) => (
            <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "#8892a4" }}>
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#f59e0b" }} />
              {a}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Reference */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="rounded-xl px-5 py-4 flex items-center gap-3 text-sm"
        style={{ background: "rgba(15,20,32,0.6)", border: "1px solid rgba(30,42,58,0.6)", color: "#4a5568" }}
      >
        <BarChart2 size={14} />
        <span>Reference: Laird, A.K. (1964). Dynamics of tumor growth. <em>British Journal of Cancer</em>, 18(3), 490–502.</span>
      </motion.div>
    </div>
  )
}
