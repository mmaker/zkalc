#!/usr/bin/env python3

import itertools
import sys
import json
from collections import defaultdict

from .common import export_measurement, to_nanoseconds, parse_benchmark_description

op_ids = [
    # scalar field
    "mul_ff",
    "add_ff",
    "msm_ff",
    "fft",
    "invert",

    # G1
    "mul_G1",
    "add_G1",

    # G2
    "mul_G2",
    "add_G2",

    # Gt
    "add_Gt",
    "mul_Gt",
    "pairing",
]

probes = {
    # zkalc naming convention

    # arkworks probes
    r'.*/msm_(G[12t]|ff)/(\d+)': lambda x, y: (f"msm_{x}", int(y)),
    r'.*/fft/(\d+)': lambda x: (f"fft", int(x)),

    f'.*/({"|".join(op_ids)})': lambda x: (x, 1),
    r'.*/msm/(\d+)': lambda x: (f"msm_G1", int(x)),

    # curve25519-dalek
    f'({"|".join(op_ids)})': lambda x: (x, 1),
    f'mul_ec': lambda: ("mul_G1", 1),
    r'msm/(G[12t]|ff)/(\d+)': lambda x, y: (f"msm_{x}", int(y)),
}

def extract_measurements(bench_output):
    measurements = defaultdict(dict)

    # Parse benchmarks and make them ready for fitting
    for measurement in itertools.chain(*bench_output):
        # Extra data from json
        operation, size = parse_benchmark_description(measurement["Task Name"], probes)
        measurement_in_ns = measurement["Average Time (ns)"]
        measurements[operation][size] = measurement_in_ns
    return measurements


def main(ins=[sys.stdin], outs=sys.stdout, curve=None):
    bench_output = [json.loads(line) for i in ins for line in i if line.strip() and (curve is None or curve.lower() in line.lower())]
    if not bench_output:
        # outs.write("{}")
        return False
    # Dictionary of results in format: { operation : measurements }
    results = {}
    # Extract measurements into a nested dictionary: { operation : {size : time_in_microseconds }}
    measurements = extract_measurements(bench_output)
    # Re-format the measurements into a dictionary: {operation : {range: [sizes], results: [times]}
    results = {operation: export_measurement(
        measurements[operation]) for operation in measurements}

    # Encode the functions as a JSON object
    json_data = json.dumps(results, indent=2)
    # Write the JSON object to the file
    outs.write(json_data)
    return True

