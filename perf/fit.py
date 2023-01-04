import sys
import math
import json
from collections import defaultdict

import numpy as np
import numpy.polynomial.polynomial as poly
import matplotlib.pyplot as plt
from scipy.interpolate import lagrange

class NoNeedForFitting(Exception): pass

RESULTS_FNAME = "results.json"
class PolyInterpolation:
    def __init__(self, sizes, times):
        self.sizes = sizes
        self.times = times
        self.polynomials = []
        self.ranges = []
        for i in range(len(sizes) - 1):
            x = [sizes[i], sizes[i+1]]
            y = [times[i], times[i+1]]
            # Returns a polynomial in poly1d form so for example [2,3] is `2*x + 3`
            polynomial = lagrange(x, y)
            self.polynomials.append(polynomial)
            self.ranges.append((x[0], x[1]))

    def predict(self, size):
        # If we are asked to predict out of range, extrapolate using the closest polynomial
        if size < self.ranges[0][0]:
            return self.polynomials[0](size)
        elif size > self.ranges[-1][1]:
            # XXX here we should be fitting to a n/logn function instead of using the interpolated poly 
            return self.polynomials[-1](size)

        for i, (start, end) in enumerate(self.ranges):
            if start <= size <= end:
                return self.polynomials[i](size)

        raise ValueError("Invalid size ")

    def plot(self):
        x = np.linspace(min(self.sizes), 2**21, 100000)
        y = [self.predict(z) for z in x]
        plt.semilogx(self.sizes, self.times, 'o', base=2)
        plt.semilogx(x, y, '-', base=2)
        plt.show()

    def export_to_javascript_in_json(self, json):
        json["arguments"] = "n"
        json["body"] = "const polynomials = ["
        for polynomial in self.polynomials:
            json["body"] += f"[{polynomial.coeffs[0]}, {polynomial.coeffs[1]}],"
        json["body"] += "];\n"
        json["body"] += "const ranges = ["
        for start, end in self.ranges:
            json["body"] += f"([{start}, {end}]),"
        json["body"] += "];\n"
        json["body"] += "for (let i = 0; i < ranges.length; i++) {\n"
        json["body"] += "    const [start, end] = ranges[i];\n"
        json["body"] += "    if (n >= start && n <= end) {\n"
        json["body"] += "        return n * polynomials[i][0] + polynomials[i][1];\n"
        json["body"] += "    }\n"
        json["body"] += "}\n"
        json["body"] += "if (n < ranges[0][0]) {\n"
        json["body"] += "    return n * polynomials[0][0] + polynomials[0][1];\n"
        json["body"] += "} else if (n > ranges[ranges.length - 1][1]) {\n"
        json["body"] += "    return n * polynomials[polynomials.length - 1][0] + polynomials[polynomials.length - 1][1];\n"
        json["body"] += "}\n"
        json["body"] += "throw new Error('Size out of range');"

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

def add_measurement_to_json(operation, json, measurement):
    """Basic linear regression: Extract a linear polynomial from the data"""

    # Get the sizes and times from the data
    sizes, times = zip(*measurement.items())

    # Handle simple non-amortized operations like mul
    # If one mul takes x ms, n muls take x*n ms.
    if len(sizes) == 1:
        polynomial = poly.Polynomial([0,times[0]])
        coeffs = ["%d" % (coeff) for coeff in polynomial]
        print("%s [%s samples] [2^28 example: %0.2f s]:\n\t%s\n" % (operation, len(measurement), polynomial(2**28)/1e9, coeffs))
        encode_poly_evaluation_as_json(json, coeffs)
        return

    # Otherwise, do an interpolation!
    interpolation = PolyInterpolation(sizes, times)
    interpolation.export_to_javascript_in_json(json)

def encode_poly_evaluation_as_json(json, coeffs):
    json["arguments"] = "n"
    json["body"] = f"return {coeffs[0]} + n * {coeffs[1]};"

def extract_measurements(bench_output):
    # Nested dictionary with benchmark results in the following format: { operation : {msm_size : time_in_microseconds }}
    measurements = defaultdict(dict)
    # Dictionary of results in format: { operation : coefficients }
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
        results[operation] = {}
        add_measurement_to_json(operation, results[operation], measurements[operation])

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
