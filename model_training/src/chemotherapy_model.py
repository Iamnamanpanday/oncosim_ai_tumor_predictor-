class ChemotherapyTumorModel:
    """
    Logistic tumor growth model with chemotherapy treatment.

    dN/dt = rN(1 - N/K) - cN
    """

    def __init__(self, initial_size, growth_rate, carrying_capacity, chemo_strength, dt=1.0):

        self.N0 = initial_size
        self.r = growth_rate
        self.K = carrying_capacity
        self.c = chemo_strength
        self.dt = dt

    def simulate(self, days):

        N = self.N0
        results = [N]

        for _ in range(days):

            growth = self.r * N * (1 - N / self.K)
            treatment = self.c * N

            N = N + (growth - treatment) * self.dt

            if N < 0:
                N = 0

            results.append(N)

        return results


# Test block
if __name__ == "__main__":

    model = ChemotherapyTumorModel(
        initial_size=100,
        growth_rate=0.2,
        carrying_capacity=10000,
        chemo_strength=0.15
    )

    result = model.simulate(days=100)

    print(result[:10])