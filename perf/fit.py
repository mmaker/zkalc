import sys
import math
import json

import numpy as np
from numpy.polynomial import Polynomial as P
import matplotlib.pyplot as plt

def parse_benchmark_description(description):
    description = description.split("/")

    match description[0]:
        case "msm":
            return description[1], description[2]

def to_nanoseconds(num, unit_str):
    """Convert `num` in `unit_str` to nanoseconds"""
    match unit_str:
        case "ns":
            return num
        case "ms":
            return num * 1e6
        case "s":
            return num * 1e9
        case _:
            raise


def plot_func(data, func):
  # Get the sizes and times from the data
  sizes, times = zip(*data.items())
  # Convert the times from nanoseconds to seconds
  times = [time / 1e9 for time in times]


  # Generate a range of sizes to use for the plot
  size_range = np.linspace(min(sizes), max(sizes), 100)
  # Compute the predicted times for the size range
  predicted_times = func(size_range)
  # Convert the predicted times from nanoseconds to seconds
  predicted_times = [time / 1e9 for time in predicted_times]

  # Create a new figure and plot the actual data
  plt.figure()
  plt.scatter(sizes, times, label='Actual data')
  # Plot the fitted linear function
  plt.plot(size_range, predicted_times, label='Linear fit')
  plt.xlabel('Size')
  plt.ylabel('Time (in seconds)')
  plt.legend()
  plt.show()


def fit_curve_to_data(data):
    # Get the sizes and times from the data
    sizes, times = zip(*data.items())
    # Use NumPy's polyfit function to fit a linear curve
    coefficients = np.polyfit(sizes, times, deg=1)
    # Return the fitted func
    return np.poly1d(coefficients)

def extract_measurements(bench_output):
    # Dictionaries with format { msm_size : time_in_microseconds }
    measurements_G1 = {}
    measurements_G2 = {}

    for measurement in bench_output:
        # Skip useless non-benchmark lines
        if "id" not in measurement:
            continue

        # Extra data from json
        group, size = parse_benchmark_description(measurement["id"])
        measurement_in_ns = to_nanoseconds(measurement["mean"]["estimate"], measurement["mean"]["unit"])

        if group == "G1":
            measurements_G1[int(size)] = measurement_in_ns
        elif group == "G2":
            measurements_G2[int(size)] = measurement_in_ns
        else:
            raise

    func = fit_curve_to_data(measurements_G1)
    print("Fitting with %s measurements!" % (len(measurements_G1)))
    print("Here is your func: %s" % (func))
    print("For 2^28 it would take %s seconds" % (func(2**28) / 1e9))

    plot_func(measurements_G1, func)

def main():
    if len(sys.argv) < 1:
        print("fit.py estimates.json")
        sys.exit(1)

    bench_output = []
    with open(sys.argv[1]) as f:
        for line in f:
            bench_output.append(json.loads(line))

    extract_measurements(bench_output)

if __name__ == '__main__':
    main()
