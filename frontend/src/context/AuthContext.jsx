import { createContext, useContext, useState, useEffect } from "react"
import { supabase } from "../supabase"

const AuthContext = createContext(null)

const ROLE_KEY = (uid) => `oncosim_role_${uid}`

export const ROLES = [
  {
    id: "researcher",
    label: "Researcher",
    emoji: "🔬",
    description: "Full simulation suite with compare mode, exports, and advanced metrics.",
    color: "#dc143c",
    bg: "rgba(220,20,60,0.08)",
    border: "rgba(220,20,60,0.2)",
  },
  {
    id: "clinician",
    label: "Clinician",
    emoji: "🩺",
    description: "Outcome-focused view: treatment verdicts, survival curve, and quick summaries.",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.2)",
  },
  {
    id: "student",
    label: "Student",
    emoji: "🎓",
    description: "Guided mode with step-by-step explanations, glossary, and learning tips.",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
  },
]

export function AuthProvider({ children }) {
  const [user,    setUser     ] = useState(null)
  const [role,    setRoleState] = useState(null)
  const [loading, setLoading  ] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        const { data, error } = await supabase.auth.signInAnonymously()
        if (error) {
          console.error("Guest login failed:", error)
        }
      }
      setLoading(false)
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) setRoleState(localStorage.getItem(ROLE_KEY(u.id)) ?? null)
      else    setRoleState(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ── Email / Password sign-up ───────────────────────────────────────────────
  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  // ── Email / Password sign-in ───────────────────────────────────────────────
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
    setRoleState(null)
  }

  function chooseRole(roleId) {
    if (!user) return
    localStorage.setItem(ROLE_KEY(user.id), roleId)
    setRoleState(roleId)
  }

  function resetRole() {
    if (!user) return
    localStorage.removeItem(ROLE_KEY(user.id))
    setRoleState(null)
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signUp, signIn, logout, chooseRole, resetRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
