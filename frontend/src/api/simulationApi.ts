export interface SimulationRequest {
  initial_size: number
  growth_rate: number
  carrying_capacity: number
  chemo_strength: number
  days: number
}

export async function runSimulation(data: SimulationRequest) {

  const response = await fetch("http://127.0.0.1:8000/simulate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    throw new Error("Simulation failed")
  }

  return response.json()
}