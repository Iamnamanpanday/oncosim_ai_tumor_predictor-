import sys
import os

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "../../../model_training/src")
    )
)

from chemotherapy_model import ChemotherapyTumorModel
from model_metrics import TumorMetrics


def run_simulation(initial_size, growth_rate, carrying_capacity, chemo_strength, days):

    model = ChemotherapyTumorModel(
        initial_size=initial_size,
        growth_rate=growth_rate,
        carrying_capacity=carrying_capacity,
        chemo_strength=chemo_strength
    )

    curve = model.simulate(days)

    metrics = {
        "peak_size": TumorMetrics.peak_size(curve),
        "final_size": TumorMetrics.final_size(curve),
        "reduction_percent": TumorMetrics.reduction_percentage(initial_size, curve[-1])
    }

    return {
        "curve": curve,
        "metrics": metrics
    }