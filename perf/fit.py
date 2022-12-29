import sys
import math
import json
from collections import defaultdict

import numpy as np
import numpy.polynomial.polynomial as poly
import matplotlib.pyplot as plt

class NoNeedForFitting(Exception): pass

RESULTS_FNAME = "results.json"

def parse_benchmark_description(description):
    description = description.split("/")

    if description[0] == "msm":
            desc = description[0] + "_" + description[1]
            return desc, description[2]
    if description[0] == "pairing_product":
            desc = description[0]
            return desc, description[1]
    if description[0] in ("mul", "add_ff", "add_ec", "invert", "pairing"):
            return description[0], 1
    else:
            raise NoNeedForFitting

def to_nanoseconds(num, unit_str):
    """Convert `num` in `unit_str` to nanoseconds"""
    units = {"ns": 1, "µs" : 1e3, "ms": 1e6, "s": 1e9}
    return num * units[unit_str]

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

def plot_error(data, func):
    # Get the sizes and times from the data
    sizes, times = zip(*data.items())

    # Calculate the error between the actual and predicted values
    errors = []
    for i, size in enumerate(sizes):
        error = times[i] - func(sizes[i])
        print("Error: %s for time %s vs predicted time %s" % (error / 1e9, times[i] / 1e9 , func(sizes[i]) / 1e9))
        errors.append(abs(error))

    plt.semilogx(sizes, errors, 'bo', label='Errors', base=2)
    plt.xlabel('Sizes')
    plt.ylabel('Errors')
    plt.title('Errors at different sizes')
    plt.legend()
    plt.show()

def fit_poly_to_data(data):
    """Basic linear regression: Extract a linear polynomial from the data"""

    # Get the sizes and times from the data
    sizes, times = zip(*data.items())

    # Handle simple non-amortized operations like mul
    # If one mul takes x ms, n muls take x*n ms.
    if len(sizes) == 1:
        return poly.Polynomial([0,times[0]])

    # For more amortized operations like MSMs we do linear regression
    # Use NumPy's polyfit function to fit a linear function to the data
    polynomial = poly.Polynomial.fit(sizes, times, deg=1)

#    plot_func(data, polynomial)
#    plot_error(data, polynomial)

    # Return the fitted func
    return polynomial

def extract_measurements(bench_output):
    # Nested dictionary with benchmark results in the following format: { operation : {msm_size : time_in_microseconds }}
    measurements = defaultdict(dict)
    # Dictionary of results in format: { operation : function_desc_str }
    results = {}

    # Parse benchmarks and make them ready for fitting
    for measurement in bench_output:
        # Skip useless non-benchmark lines
        if "id" not in measurement:
            continue

        # Extra data from json
        try:
            operation, size = parse_benchmark_description(measurement["id"])
        except NoNeedForFitting:
            continue

        measurement_in_ns = to_nanoseconds(measurement["mean"]["estimate"], measurement["mean"]["unit"])
        measurements[operation][int(size)] = measurement_in_ns

    # Fit benchmark data to polynomial
    for operation in measurements.keys():
        poly = fit_poly_to_data(measurements[operation])
        coeffs = ["%d" % (coeff) for coeff in poly]
        print("%s [%s samples] [2^28 example: %0.2f s]:\n\t%s\n" % (operation, len(measurements[operation]), poly(2**28)/1e9, coeffs))
        results[operation] = f"(n) => {coeffs[0]} + n * {coeffs[1]}"


    # Write results to json file
    with open(RESULTS_FNAME, "w") as f:
        # Encode the functions as a JSON object
        json_data = json.dumps(results)
        # Write the JSON object to the file
        f.write(json_data)

    print(f"[!] Wrote results to '{RESULTS_FNAME}'! Bye!")

def main():
    if len(sys.argv) < 1:
        print("[!] fit.py estimates.json")
        sys.exit(1)

    bench_output = []
    with open(sys.argv[1]) as f:
        for line in f:
            bench_output.append(json.loads(line))

    extract_measurements(bench_output)

if __name__ == '__main__':
    main()
