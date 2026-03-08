import matplotlib.pyplot as plt
from logistic_model import LogisticTumorGrowth


# Create model
model = LogisticTumorGrowth(
    initial_size=100,
    growth_rate=0.2,
    carrying_capacity=10000
)

# Run simulation
days = 100
results = model.simulate(days)

# Create time axis
time = list(range(days + 1))


# Plot tumor growth
plt.figure(figsize=(8,5))
plt.plot(time, results, label="Tumor Growth", color="red")

plt.xlabel("Time (days)")
plt.ylabel("Tumor Size")
plt.title("Logistic Tumor Growth Simulation")

plt.legend()
plt.grid(True)

plt.show()