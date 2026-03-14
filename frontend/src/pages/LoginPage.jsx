import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../context/AuthContext"
import { Dna, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react"

function InputField({ label, type, value, onChange, placeholder, icon: Icon, show, onToggle }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium" style={{ color: "#a0aec0" }}>{label}</label>
      <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#4a5568" }} />
        <input
          type={show !== undefined ? (show ? "text" : "password") : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={type === "password" ? "current-password" : "email"}
          className="w-full py-3 pl-10 pr-10 rounded-xl text-sm text-white outline-none transition-all"
          style={{
            background: "rgba(8,11,18,0.8)",
            border: "1px solid rgba(30,42,58,0.9)",
          }}
          onFocus={e  => { e.currentTarget.style.borderColor = "var(--accent-border-hi)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--accent-soft)" }}
          onBlur={e   => { e.currentTarget.style.borderColor = "rgba(30,42,58,0.9)"; e.currentTarget.style.boxShadow = "none" }}
        />
        {onToggle && (
          <button type="button" onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2" tabIndex={-1}>
            {show ? <EyeOff size={15} style={{ color: "#4a5568" }} /> : <Eye size={15} style={{ color: "#4a5568" }} />}
          </button>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { signIn, signUp, guestSignIn } = useAuth()

  const [mode,     setMode    ] = useState("signin")   // "signin" | "signup"
  const [email,    setEmail   ] = useState("")
  const [password, setPassword] = useState("")
  const [showPw,   setShowPw  ] = useState(false)
  const [loading,  setLoading ] = useState(false)
  const [error,    setError   ] = useState(null)
  const [success,  setSuccess ] = useState(null)

  async function handleGuestLogin() {
    setLoading(true); setError(null); setSuccess(null)
    try {
      await guestSignIn()
      // Auth state change will re-render to role selector
    } catch (err) {
      setError(err.message ?? "Guest login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

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
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="rounded-3xl p-10"
          style={{
            background: "rgba(15,20,32,0.92)",
            border: "1px solid rgba(30,42,58,0.9)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.65)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.06 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-dark))", boxShadow: "0 0 24px var(--accent-glow)" }}
            >
              <Dna size={22} className="text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-white">OncoSim</h1>
              <p className="text-xs" style={{ color: "#4a5568" }}>Computational Oncology Platform</p>
            </div>
          </div>

          {/* Mode tabs */}
          <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: "rgba(8,11,18,0.7)", border: "1px solid rgba(30,42,58,0.8)" }}>
            {[["signin", "Sign In"], ["signup", "Create Account"]].map(([m, label]) => (
              <motion.button
                key={m}
                onClick={() => { setMode(m); setError(null); setSuccess(null) }}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: mode === m ? "rgba(30,42,58,0.9)" : "transparent",
                  color: mode === m ? "white" : "#4a5568",
                  border: mode === m ? "1px solid rgba(30,42,58,1)" : "1px solid transparent",
                }}
                whileTap={{ scale: 0.97 }}
              >
                {label}
              </motion.button>
            ))}
          </div>

          {/* Guest Login Button */}
          <motion.button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all mb-6"
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
              color: "white",
              border: "1px solid var(--accent-border)",
              boxShadow: "0 0 20px var(--accent-glow)",
            }}
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px var(--accent-glow)" }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Signing in..." : "Try as Guest"}
          </motion.button>

          {/* Title */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              <h2 className="text-2xl font-bold text-white">
                {mode === "signin" ? "Welcome back" : "Get started"}
              </h2>
              <p className="text-sm mt-1" style={{ color: "#8892a4" }}>
                {mode === "signin"
                  ? "Sign in to access your personalized dashboard."
                  : "Create a free account — no credit card needed."}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 rounded-xl px-4 py-3 mb-4 text-xs"
                style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-border)", color: "var(--accent-light)" }}>
                <AlertCircle size={14} className="shrink-0 mt-0.5" />{error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 rounded-xl px-4 py-3 mb-4 text-xs"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}>
                <CheckCircle2 size={14} className="shrink-0 mt-0.5" />{success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" icon={Mail} />
            <InputField label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 6 characters" icon={Lock} show={showPw} onToggle={() => setShowPw(!showPw)} />

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? undefined : "0 0 28px var(--accent-glow)" }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2.5 text-sm font-semibold text-white transition-all mt-2 disabled:opacity-60"
              style={{
                background: loading ? "var(--accent-dim)" : "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                border: "1px solid var(--accent-border-hi)",
              }}
            >
              {loading ? (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              ) : (
                <ArrowRight size={16} />
              )}
              {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="text-center text-[11px] mt-6" style={{ color: "#2d3748" }}>
            For educational and research purposes only
          </p>
        </div>
      </motion.div>
    </div>
  )
}
