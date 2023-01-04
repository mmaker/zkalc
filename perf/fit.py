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
    """Perform a polynomial interpolation at a dataset of operations of `sizes` that take time `times`."""
    def __init__(self, sizes, times):
        self.sizes = sizes
        self.times = times
        # Polynomials are stored in poly1d form (so for example [2,3] is `2*x + 3`)
        self.polynomials = []
        self.ranges = []

        # Do an interpolation for each pair of points
        for i in range(len(sizes) - 1):
            x = [sizes[i], sizes[i+1]]
            y = [times[i], times[i+1]]
            polynomial = lagrange(x, y)
            self.polynomials.append(polynomial)
            self.ranges.append([x[0], x[1]])

    def predict(self, size):
        """Use the interpolation results to predict the time at an arbitrary `size`"""

        # We are asked to predict out of range: extrapolate using the closest polynomial
        if size < self.ranges[0][0]:
            return self.polynomials[0](size)
        elif size > self.ranges[-1][1]:
            # XXX here we should be fitting to a n/logn function instead of using the interpolated poly
            return self.polynomials[-1](size)

        # Find the right polynomial
        for i, (start, end) in enumerate(self.ranges):
            if start <= size <= end:
                return self.polynomials[i](size)

        raise ValueError("Invalid size")

    def plot(self):
        """Plot the interpolated functions against the actual data"""
        x = np.linspace(min(self.sizes), 2**21, 100000)
        y = [self.predict(z) for z in x]
        plt.semilogx(self.sizes, self.times, 'o', base=2)
        plt.semilogx(x, y, '-', base=2)
        plt.show()

    def to_javascript(self):
        """Export the interpolation results to a Javascript function in json format"""
        output = {}
        output["arguments"] = "n"
        output["body"] = f'''
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
        return output

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

def convert_measurement_to_js_function(operation, measurement):
    """Fit this measurement's data to a function, and export it as Javascript code"""

    # Get the sizes and times from the data
    sizes, times = zip(*measurement.items())

    # Handle simple non-amortized operations like mul:
    # If one mul takes x ms, n muls take x*n ms.
    if len(sizes) == 1:
        polynomial = poly.Polynomial([0,times[0]])
        coeffs = list(map(str, polynomial))
        x = int(times[0])
        estimate = x * 2**28 * 1e-9
        print(f"{operation} [{len(measurement)} samples] [2^28 example: {estimate:.2} s]:\n\t{coeffs}\n", file=sys.stderr)
        return basic_operation_to_js(x)
    else:
        # It's a complicated operation: do an interpolation!
        interpolation = PolyInterpolation(sizes, times)
        return interpolation.to_javascript()

def basic_operation_to_js(x):
    """Given an operation that takes `x` ms, return a Javascript function that computes `n*x`"""
    output = {}
    output["arguments"] = "n"
    output["body"] = f"return n * {x};"
    return output

def extract_measurements(bench_output):
    measurements = defaultdict(dict)

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

    return measurements

def convert_benchmark_to_javascript(bench_output):
    # Dictionary of results in format: { operation : javascript_function }
    results = {}

    # Extract measurements into a nested dictionary: { operation : {size : time_in_microseconds }}
    measurements = extract_measurements(bench_output)

    # Fit each operation to a Javascript function
    for operation in measurements.keys():
        js_function = convert_measurement_to_js_function(operation, measurements[operation])
        results[operation] = js_function

    # Write results to json file
    # Encode the functions as a JSON object
    json_data = json.dumps(results)
    # Write the JSON object to the file
    sys.stdout.write(json_data)
    print(f"[!] Results written! Bye!", file=sys.stderr)


if __name__ == '__main__':
    bench_output = [json.loads(line) for line in sys.stdin]
    convert_benchmark_to_javascript(bench_output)
