class TumorMetrics:
    """
    Compute useful statistics from tumor growth simulations.
    """

    @staticmethod
    def peak_size(data):
        """
        Maximum tumor size reached
        """
        return max(data)

    @staticmethod
    def final_size(data):
        """
        Tumor size at the end of simulation
        """
        return data[-1]

    @staticmethod
    def reduction_percentage(initial_size, final_size):
        """
        Percentage reduction due to treatment
        """
        reduction = ((initial_size - final_size) / initial_size) * 100
        return reduction

    @staticmethod
    def time_to_stabilization(data, threshold=0.01):
        """
        Estimate when tumor growth stabilizes
        """

        for i in range(1, len(data)):

            change = abs(data[i] - data[i-1])

            if change < threshold:
                return i

        return None


# Test block
if __name__ == "__main__":

    sample_data = [100, 120, 140, 160, 180, 190, 195, 197, 198, 198.5]

    print("Peak size:", TumorMetrics.peak_size(sample_data))
    print("Final size:", TumorMetrics.final_size(sample_data))
    print("Reduction %:", TumorMetrics.reduction_percentage(100, sample_data[-1]))
    print("Stabilization time:", TumorMetrics.time_to_stabilization(sample_data))