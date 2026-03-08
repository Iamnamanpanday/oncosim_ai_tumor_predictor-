export interface SimulationRequest {
  initial_size: number
  growth_rate: number
  carrying_capacity: number
  chemo_strength: number
  days: number
}

// In production, set VITE_API_URL in Vercel dashboard to your deployed backend
// e.g. https://your-backend.railway.app
// Locally falls back to http://127.0.0.1:8000
const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"

export async function runSimulation(data: SimulationRequest) {
  const response = await fetch(`${API_BASE}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Simulation failed")
  return response.json()
}