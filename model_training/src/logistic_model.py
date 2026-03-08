import numpy as np


class LogisticTumorGrowth:
    """
    Logistic Tumor Growth Model

    dN/dt = rN(1 - N/K)

    N : tumor size
    r : growth rate
    K : carrying capacity
    """

    def __init__(self, initial_size, growth_rate, carrying_capacity, dt=1.0):

        self.N0 = initial_size
        self.r = growth_rate
        self.K = carrying_capacity
        self.dt = dt

    def simulate(self, days):

        N = self.N0
        results = [N]

        for _ in range(days):

            growth = self.r * N * (1 - N / self.K)

            N = N + growth * self.dt

            if N < 0:
                N = 0

            results.append(N)

        return results


# Test execution
if __name__ == "__main__":

    model = LogisticTumorGrowth(
        initial_size=100,
        growth_rate=0.2,
        carrying_capacity=10000
    )

    result = model.simulate(days=100)

    print(result[:10])