import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Dna, ArrowRight, User } from "lucide-react"

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg-base)", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[480px] h-[480px] rounded-full"
          style={{ top: "-15%", right: "-5%", background: "radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute w-72 h-72 rounded-full"
          style={{ bottom: "0%", left: "-5%", background: "radial-gradient(circle, var(--accent-soft) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4 text-center"
      >
        <div
          className="rounded-3xl p-10 flex flex-col items-center"
          style={{
            background: "rgba(15,20,32,0.92)",
            border: "1px solid rgba(30,42,58,0.9)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.65)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Logo */}
          <motion.div
            whileHover={{ rotate: 8, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="w-16 h-16 mb-6 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))", boxShadow: "0 0 24px var(--accent-glow)" }}
          >
            <Dna size={32} className="text-white" />
          </motion.div>
            
          <h1 className="text-3xl font-bold text-white mb-2">OncoSim</h1>
          <p className="text-sm mb-8" style={{ color: "#8892a4" }}>AI Tumor Predictor & Simulation Platform</p>

          <div className="w-full space-y-4">
            <motion.button
              onClick={() => navigate("/app")}
              className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2.5 text-sm font-semibold transition-all relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                color: "white",
                border: "1px solid var(--accent-border)",
                boxShadow: "0 0 20px var(--accent-glow)",
              }}
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px var(--accent-glow)" }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              Continue as Guest
            </motion.button>

            <motion.button
              onClick={() => navigate("/login")}
              className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2.5 text-sm font-semibold transition-all"
              style={{
                background: "rgba(30,42,58,0.5)",
                color: "white",
                border: "1px solid rgba(30,42,58,0.9)",
              }}
              whileHover={{ scale: 1.02, background: "rgba(30,42,58,0.8)" }}
              whileTap={{ scale: 0.98 }}
            >
              <User size={18} />
              Sign In
            </motion.button>
          </div>
          
          <p className="text-[11px] mt-8" style={{ color: "#4a5568" }}>
            For educational and research purposes only
          </p>
        </div>
      </motion.div>
    </div>
  )
}
