from fastapi import APIRouter
from pydantic import BaseModel

from app.services.tumor_simulation import run_simulation


router = APIRouter()


class SimulationRequest(BaseModel):

    initial_size: float
    growth_rate: float
    carrying_capacity: float
    chemo_strength: float
    days: int


@router.post("/simulate")
def simulate_tumor(request: SimulationRequest):

    result = run_simulation(
        initial_size=request.initial_size,
        growth_rate=request.growth_rate,
        carrying_capacity=request.carrying_capacity,
        chemo_strength=request.chemo_strength,
        days=request.days
    )

    return result