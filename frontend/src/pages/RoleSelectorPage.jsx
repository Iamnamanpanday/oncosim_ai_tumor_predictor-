import { motion } from "framer-motion"
import { useAuth, ROLES } from "../context/AuthContext"
import { Dna, ChevronRight } from "lucide-react"

export default function RoleSelectorPage() {
  const { user, chooseRole, logout } = useAuth()

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--bg-base)", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {ROLES.map((r, i) => (
          <div
            key={r.id}
            className="absolute w-72 h-72 rounded-full"
            style={{
              background: `radial-gradient(circle, ${r.bg} 0%, transparent 70%)`,
              filter: "blur(70px)",
              top: i === 0 ? "5%"  : i === 1 ? "50%" : "75%",
              left: i === 0 ? "70%" : i === 1 ? "5%"  : "60%",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
              boxShadow: "0 0 20px var(--accent-glow)",
            }}
          >
            <Dna size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">OncoSim</h1>
            <p className="text-xs" style={{ color: "#4a5568" }}>
              Hi {user?.displayName?.split(" ")[0]} 👋
            </p>
          </div>
          <button
            onClick={logout}
            className="ml-auto text-xs px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(30,42,58,0.6)", border: "1px solid rgba(30,42,58,0.8)", color: "#4a5568" }}
          >
            Sign out
          </button>
        </div>

        <div
          className="rounded-3xl p-8"
          style={{
            background: "rgba(19,25,40,0.9)",
            border: "1px solid rgba(30,42,58,0.9)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">Who are you?</h2>
          <p className="text-sm mb-8" style={{ color: "#8892a4" }}>
            Choose your role to get a dashboard tailored to your needs.
            You can switch anytime from your profile.
          </p>

          <div className="space-y-3">
            {ROLES.map((role, i) => (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => chooseRole(role.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all group"
                style={{
                  background: role.bg,
                  border: `1px solid ${role.border}`,
                }}
              >
                <span className="text-2xl">{role.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{role.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#8892a4" }}>{role.description}</p>
                </div>
                <ChevronRight
                  size={16}
                  style={{ color: role.color }}
                  className="transition-transform group-hover:translate-x-1"
                />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
