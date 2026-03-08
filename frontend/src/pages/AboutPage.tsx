import { motion } from "framer-motion"
import { Github, ExternalLink, Dna, User, Globe, Layers, Shield, Zap } from "lucide-react"

const stack = [
  { name: "React 18", role: "UI Framework", color: "#61dafb" },
  { name: "TypeScript", role: "Type Safety", color: "#3178c6" },
  { name: "Vite 5", role: "Build Tool", color: "#646cff" },
  { name: "TailwindCSS", role: "Styling", color: "#38bdf8" },
  { name: "Framer Motion", role: "Animations", color: "#ff4d6d" },
  { name: "Recharts", role: "Data Visualization", color: "#8884d8" },
  { name: "React Three Fiber", role: "3D Rendering", color: "#f97316" },
  { name: "FastAPI", role: "Backend API", color: "#009688" },
  { name: "Python", role: "Simulation Engine", color: "#f7c948" },
]

const features = [
  { icon: Zap, color: "#f59e0b", title: "Real-time Simulation", desc: "Logistic growth ODE solved server-side via FastAPI, streamed to the browser instantly." },
  { icon: Layers, color: "#3b82f6", title: "3D Tumor Visualization", desc: "WebGL-based sphere rendered with React Three Fiber, animating in real time as data arrives." },
  { icon: Globe, color: "#10b981", title: "Interactive Controls", desc: "Fully parametric sliders controlling initial size, growth rate, chemo strength, and duration." },
  { icon: Shield, color: "#dc143c", title: "Clinical Scenarios", desc: "Pre-configured experiments covering untreated, partial, and complete chemotherapy responses." },
]

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
}

export default function AboutPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest"
            style={{ background: "rgba(220,20,60,0.12)", border: "1px solid rgba(220,20,60,0.25)", color: "#dc143c" }}>
            v1.0 · Research Tool
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">About OncoSim</h1>
        <p className="text-base max-w-2xl" style={{ color: "#8892a4" }}>
          An open-source computational oncology simulator built for researchers and students exploring tumor growth dynamics and therapeutic response.
        </p>
      </motion.div>

      <div className="h-px" style={{ background: "linear-gradient(90deg, rgba(220,20,60,0.4) 0%, rgba(30,42,58,0.5) 60%, transparent 100%)" }} />

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl p-8 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(220,20,60,0.12) 0%, rgba(19,25,40,0.9) 60%)", border: "1px solid rgba(220,20,60,0.25)" }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(220,20,60,0.1) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="relative z-10 flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #dc143c, #8b0000)", boxShadow: "0 0 24px rgba(220,20,60,0.4)" }}>
            <Dna size={26} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">OncoSim</h2>
            <p className="text-sm leading-relaxed max-w-xl" style={{ color: "#8892a4" }}>
              OncoSim combines a mathematical logistic tumor growth model with an interactive web dashboard.
              It enables real-time exploration of how tumor cell populations evolve under varying growth rates,
              carrying capacities, and chemotherapy regimens — bridging computational biology with intuitive visualization.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Features */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "#4a5568" }}>
          <span className="w-4 h-px" style={{ background: "#4a5568", display: "inline-block" }} />
          Key Features
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div key={f.title} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                className="rounded-xl p-5 flex items-start gap-4"
                style={{ background: "rgba(19,25,40,0.8)", border: "1px solid rgba(30,42,58,0.8)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}33` }}>
                  <Icon size={17} style={{ color: f.color }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#8892a4" }}>{f.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Tech stack */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="rounded-2xl p-6"
        style={{ background: "rgba(19,25,40,0.8)", border: "1px solid rgba(30,42,58,0.8)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#4a5568" }}>Technology Stack</p>
        <div className="flex flex-wrap gap-2">
          {stack.map((s) => (
            <span key={s.name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: "rgba(8,11,18,0.7)", border: "1px solid rgba(30,42,58,0.8)" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
              <span className="text-white">{s.name}</span>
              <span style={{ color: "#4a5568" }}>· {s.role}</span>
            </span>
          ))}
        </div>
      </motion.div>

      {/* Author + links */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4"
        style={{ background: "rgba(19,25,40,0.8)", border: "1px solid rgba(30,42,58,0.8)" }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(220,20,60,0.15)", border: "1px solid rgba(220,20,60,0.3)" }}>
            <User size={18} style={{ color: "#dc143c" }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">OncoSim Project</p>
            <p className="text-xs" style={{ color: "#4a5568" }}>Computational Oncology · Open Source Research Tool</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: "rgba(15,20,32,0.8)", border: "1px solid rgba(30,42,58,0.8)", color: "#8892a4" }}>
            <Github size={14} /> GitHub
          </a>
          <a href="https://fastapi.tiangolo.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: "rgba(220,20,60,0.1)", border: "1px solid rgba(220,20,60,0.25)", color: "#dc143c" }}>
            <ExternalLink size={14} /> API Docs
          </a>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <div className="rounded-xl px-5 py-4 text-xs leading-relaxed" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", color: "#6b5a2a" }}>
        ⚠️ <strong className="text-yellow-600">Research purposes only.</strong> OncoSim is a simplified mathematical model and does not represent clinical reality. Results should not be used for medical decision-making.
      </div>
    </div>
  )
}
