import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import LoginPage from "./pages/LoginPage"
import RoleSelectorPage from "./pages/RoleSelectorPage"
import ResearcherDashboard from "./pages/dashboards/ResearcherDashboard"
import ClinicianDashboard  from "./pages/dashboards/ClinicianDashboard"
import StudentDashboard    from "./pages/dashboards/StudentDashboard"
import LandingPage from "./pages/LandingPage"
import AIChatbot from "./components/AIChatbot"
import { motion } from "framer-motion"
import { Dna } from "lucide-react"

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
          boxShadow: "0 0 32px var(--accent-glow)",
        }}
      >
        <Dna size={28} className="text-white" />
      </motion.div>
    </div>
  )
}

const ROLE_DASHBOARDS = {
  researcher: ResearcherDashboard,
  clinician:  ClinicianDashboard,
  student:    StudentDashboard,
}

function App() {
  const { user, role, loading } = useAuth()

  if (loading) return <LoadingScreen />
  
  if (user && !role) return <RoleSelectorPage />

  const Dashboard = ROLE_DASHBOARDS[role] ?? ResearcherDashboard
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<Dashboard />} />
        <Route path="/login" element={user ? <Navigate to="/app" /> : <LoginPage />} />
      </Routes>
      {/* Floating AI chatbot — available on all dashboards */}
      <AIChatbot />
    </>
  )
}

export default App