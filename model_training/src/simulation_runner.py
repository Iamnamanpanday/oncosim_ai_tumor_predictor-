from chemotherapy_model import ChemotherapyTumorModel


class TumorSimulationRunner:
    """
    Runs multiple tumor growth scenarios for comparison.
    """

    def __init__(self, initial_size, growth_rate, carrying_capacity, days):

        self.initial_size = initial_size
        self.r = growth_rate
        self.K = carrying_capacity
        self.days = days

    def run_scenarios(self):

        scenarios = {
            "no_treatment": 0.0,
            "weak_chemo": 0.05,
            "moderate_chemo": 0.15,
            "strong_chemo": 0.30
        }

        results = {}

        for scenario, chemo_strength in scenarios.items():

            model = ChemotherapyTumorModel(
                initial_size=self.initial_size,
                growth_rate=self.r,
                carrying_capacity=self.K,
                chemo_strength=chemo_strength
            )

            results[scenario] = model.simulate(self.days)

        return results


# Test block
if __name__ == "__main__":

    runner = TumorSimulationRunner(
        initial_size=100,
        growth_rate=0.2,
        carrying_capacity=10000,
        days=100
    )

    results = runner.run_scenarios()

    for scenario, data in results.items():
        print(f"\n{scenario}")
        print(data[:10])