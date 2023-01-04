#!/usr/bin/env python3
"""
Usage:
    fit.py < coefficients.json > results.json
"""
import sys
import math
import json
from collections import defaultdict

import numpy as np
import numpy.polynomial.polynomial as poly
import matplotlib.pyplot as plt
from scipy.interpolate import lagrange

class NoNeedForFitting(Exception): pass

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
            self.ranges.append([x[0], x[1]])

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
        json["body"] = f'''
        const polynomials = {str([x.coeffs.tolist() for x in self.polynomials])};
        const ranges = {str(self.ranges)};
        for (let i = 0; i < ranges.length; i++) {{
            const [start, end] = ranges[i];
            if (n >= start && n <= end) {{
                return n * polynomials[i][0] + polynomials[i][1];
            }}
        }}
        if (n < ranges[0][0]) {{
            return n * polynomials[0][0] + polynomials[0][1];
        }} else if (n > ranges[ranges.length - 1][1]) {{
            return n * polynomials[polynomials.length - 1][0] + polynomials[polynomials.length - 1][1];
        }}
        throw new Error('Size out of range')
        '''

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
        coeffs = list(map(str, polynomial))
        estimate = polynomial(2**28)*1e-9
        print(f"{operation} [{len(measurement)} samples] [2^28 example: {estimate:.2} s]:\n\t{coeffs}\n", file=sys.stderr)
        encode_poly_evaluation_as_json(json, coeffs)
    else: # Otherwise, do an interpolation!
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
    # Encode the functions as a JSON object
    json_data = json.dumps(results)
    # Write the JSON object to the file
    sys.stdout.write(json_data)

    print(f"[!] Results written! Bye!", file=sys.stderr)


if __name__ == '__main__':
    bench_output = [json.loads(line) for line in sys.stdin]
    extract_measurements(bench_output)