import { createContext, useContext, useState, useEffect } from "react"

// ── Theme Definitions ─────────────────────────────────────────────────────────
export const THEMES = [
  {
    id: "crimson",
    name: "Crimson",
    description: "Classic dark red — the default",
    dot: "#dc143c",
    vars: {
      "--accent":           "#dc143c",
      "--accent-light":     "#ff4d70",
      "--accent-soft":      "rgba(220,20,60,0.08)",
      "--accent-dim":       "rgba(220,20,60,0.15)",
      "--accent-glow":      "rgba(220,20,60,0.4)",
      "--accent-border":    "rgba(220,20,60,0.25)",
      "--accent-border-hi": "rgba(220,20,60,0.35)",
      "--accent-dark":      "#8b0000",
      "--bg-base":          "#080b12",
      "--bg-sidebar-from":  "#0a0f1e",
      "--bg-sidebar-to":    "#080b12",
      "--hero-gradient":    "linear-gradient(135deg, #ffffff 0%, #e8edf5 40%, #ff4d70 100%)",
      "--chart-line":       "#dc143c",
      "--chart-area":       "rgba(220,20,60,0.35)",
    },
  },
  {
    id: "cyber",
    name: "Cyber Blue",
    description: "Electric cyan — high-tech terminal",
    dot: "#00c8ff",
    vars: {
      "--accent":           "#00c8ff",
      "--accent-light":     "#40d8ff",
      "--accent-soft":      "rgba(0,200,255,0.08)",
      "--accent-dim":       "rgba(0,200,255,0.15)",
      "--accent-glow":      "rgba(0,200,255,0.4)",
      "--accent-border":    "rgba(0,200,255,0.25)",
      "--accent-border-hi": "rgba(0,200,255,0.35)",
      "--accent-dark":      "#007ba0",
      "--bg-base":          "#02080f",
      "--bg-sidebar-from":  "#030c18",
      "--bg-sidebar-to":    "#02080f",
      "--hero-gradient":    "linear-gradient(135deg, #ffffff 0%, #e8edf5 40%, #00c8ff 100%)",
      "--chart-line":       "#00c8ff",
      "--chart-area":       "rgba(0,200,255,0.3)",
    },
  },
  {
    id: "biogreen",
    name: "Bio Green",
    description: "Neon green — biopunk terminal",
    dot: "#00e87a",
    vars: {
      "--accent":           "#00e87a",
      "--accent-light":     "#33ff99",
      "--accent-soft":      "rgba(0,232,122,0.08)",
      "--accent-dim":       "rgba(0,232,122,0.15)",
      "--accent-glow":      "rgba(0,232,122,0.4)",
      "--accent-border":    "rgba(0,232,122,0.25)",
      "--accent-border-hi": "rgba(0,232,122,0.35)",
      "--accent-dark":      "#007a40",
      "--bg-base":          "#030e07",
      "--bg-sidebar-from":  "#04100a",
      "--bg-sidebar-to":    "#030e07",
      "--hero-gradient":    "linear-gradient(135deg, #ffffff 0%, #e8edf5 40%, #00e87a 100%)",
      "--chart-line":       "#00e87a",
      "--chart-area":       "rgba(0,232,122,0.3)",
    },
  },
  {
    id: "nebula",
    name: "Nebula",
    description: "Deep purple — cosmic and mysterious",
    dot: "#a855f7",
    vars: {
      "--accent":           "#a855f7",
      "--accent-light":     "#c084fc",
      "--accent-soft":      "rgba(168,85,247,0.08)",
      "--accent-dim":       "rgba(168,85,247,0.15)",
      "--accent-glow":      "rgba(168,85,247,0.4)",
      "--accent-border":    "rgba(168,85,247,0.25)",
      "--accent-border-hi": "rgba(168,85,247,0.35)",
      "--accent-dark":      "#6b21a8",
      "--bg-base":          "#080612",
      "--bg-sidebar-from":  "#0d0a1e",
      "--bg-sidebar-to":    "#080612",
      "--hero-gradient":    "linear-gradient(135deg, #ffffff 0%, #e8edf5 40%, #c084fc 100%)",
      "--chart-line":       "#a855f7",
      "--chart-area":       "rgba(168,85,247,0.3)",
    },
  },
  {
    id: "solar",
    name: "Solar Flare",
    description: "Warm orange — intense and bold",
    dot: "#f97316",
    vars: {
      "--accent":           "#f97316",
      "--accent-light":     "#fb923c",
      "--accent-soft":      "rgba(249,115,22,0.08)",
      "--accent-dim":       "rgba(249,115,22,0.15)",
      "--accent-glow":      "rgba(249,115,22,0.4)",
      "--accent-border":    "rgba(249,115,22,0.25)",
      "--accent-border-hi": "rgba(249,115,22,0.35)",
      "--accent-dark":      "#9a3412",
      "--bg-base":          "#0f0804",
      "--bg-sidebar-from":  "#160d06",
      "--bg-sidebar-to":    "#0f0804",
      "--hero-gradient":    "linear-gradient(135deg, #ffffff 0%, #e8edf5 40%, #fb923c 100%)",
      "--chart-line":       "#f97316",
      "--chart-area":       "rgba(249,115,22,0.3)",
    },
  },
]

// ── Context ───────────────────────────────────────────────────────────────────
const ThemeContext = createContext(null)

const LS_THEME_KEY = "oncosim_theme"

export function ThemeProvider({ children }) {
  const [activeThemeId, setActiveThemeId] = useState(
    () => localStorage.getItem(LS_THEME_KEY) ?? "crimson"
  )

  const activeTheme = THEMES.find((t) => t.id === activeThemeId) ?? THEMES[0]

  // Inject CSS variables on every theme change
  useEffect(() => {
    const root = document.documentElement
    Object.entries(activeTheme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    // Also update bg-base on body directly for full-page background
    document.body.style.background = activeTheme.vars["--bg-base"]
    localStorage.setItem(LS_THEME_KEY, activeThemeId)
  }, [activeThemeId, activeTheme])

  function setTheme(id) {
    setActiveThemeId(id)
  }

  return (
    <ThemeContext.Provider value={{ activeTheme, themes: THEMES, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}
