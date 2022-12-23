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

def fit_curve_to_data(data):
    # Get the sizes and times from the data
    sizes, times = zip(*data.items())
    # Use NumPy's polyfit function to fit a polynomial curve to the data
    coefficients = np.polyfit(sizes, times, deg=2)
    # Return the fitted polynomial as a function
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

    poly = fit_curve_to_data(measurements_G1)
    print("Fitting with %s measurements!" % (len(measurements_G1)))
    print("Here is your poly: %s" % (poly))
    print(poly(2**28))

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
