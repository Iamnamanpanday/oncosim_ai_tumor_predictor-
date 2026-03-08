import matplotlib.pyplot as plt
from simulation_runner import TumorSimulationRunner


# Create simulation runner
runner = TumorSimulationRunner(
    initial_size=100,
    growth_rate=0.2,
    carrying_capacity=10000,
    days=100
)

# Run scenarios
results = runner.run_scenarios()

# Time axis
time = list(range(101))


plt.figure(figsize=(10,6))

# Plot each scenario
for scenario, data in results.items():
    plt.plot(time, data, label=scenario)


plt.xlabel("Time (days)")
plt.ylabel("Tumor Size")
plt.title("Tumor Growth Under Different Chemotherapy Levels")

plt.legend()
plt.grid(True)

plt.show()