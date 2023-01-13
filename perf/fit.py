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

class NoNeedForFitting(Exception): pass

def parse_benchmark_description(description):
    description = description.split("/")

    if description[0] == "msm":
        desc = description[0] + "_" + description[1]
        return desc, description[2]
    if description[0] == "pairing_product":
        desc = description[0]
        return desc, description[1]
    if description[0] in ("mul_ff", "mul_ec", "add_ff", "add_ec", "mul_ec", "invert", "pairing"):
        return description[0], 1
    else:
        raise NoNeedForFitting

def to_nanoseconds(num, unit_str):
    """Convert `num` in `unit_str` to nanoseconds"""
    units = {"ns": 1, "µs" : 1e3, "ms": 1e6, "s": 1e9}
    return num * units[unit_str]

def export_measurement_to_json(operation, measurement):
    """Export this measurement in json"""

    # Get the sizes and times from the data
    sizes, times = zip(*measurement.items())

    # Handle simple non-amortized operations like mul:
    # If one mul takes x ms, n muls take x*n ms.
    if len(sizes) == 1:
        x = int(times[0])
        print(f"{operation} [{len(measurement)} samples] [2^28 example: {(x * 2**28 * 1e-9):.2} s]:\n\t{x}\n", file=sys.stderr)
        return {"range": [1], "results": [x]}
    else:
        return {"range": sizes, "results": times}

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

def dump_benchmarks_to_json(bench_output):
    # Dictionary of results in format: { operation : measurements }
    results = {}

    # Extract measurements into a nested dictionary: { operation : {size : time_in_microseconds }}
    measurements = extract_measurements(bench_output)

    # Fit each operation to a Javascript function
    for operation in measurements.keys():
        measurement_json = export_measurement_to_json(operation, measurements[operation])
        results[operation] = measurement_json

    # Write results to json file
    # Encode the functions as a JSON object
    json_data = json.dumps(results)
    # Write the JSON object to the file
    sys.stdout.write(json_data)
    print(f"[!] Results written! Bye!", file=sys.stderr)


if __name__ == '__main__':
    bench_output = [json.loads(line) for line in sys.stdin]
    dump_benchmarks_to_json(bench_output)
