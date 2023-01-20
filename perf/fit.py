#!/usr/bin/env python3
"""
Usage:
    fit.py < coefficients.json > results.json
"""
import sys
import json
from collections import defaultdict
import re


probes = {
    r'msm/G([12])/(\d+)': lambda x, y: (f"msm_{x}", int(y)),
    r'(mul_ff|mul_ec|add_ff|add_ec|mul_ec|invert|pairing)': lambda x: (x, 1),
}

def parse_benchmark_description(description):
    ## match description against the list of probes
    for probe in probes:
        match = re.match(probe, description)
        if match:
            return probes[probe](*match.groups())
    else:
        print(f"No probe found for {description}", file=sys.stderr)
        raise LookupError

def to_nanoseconds(num, unit_str):
    """Convert `num` in `unit_str` to nanoseconds"""
    units = {"ns": 1, "µs" : 1e3, "ms": 1e6, "s": 1e9}
    return num * units[unit_str]

def export_measurement_to_json(operation, measurement):
    """Export this measurement in json"""

    # Get the sizes and times from the data
    sizes, times = zip(*measurement.items())
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
        except LookupError:
            continue

        measurement_in_ns = to_nanoseconds(measurement["mean"]["estimate"], measurement["mean"]["unit"])
        measurements[operation][size] = measurement_in_ns

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
