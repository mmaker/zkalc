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

def extract_measurements(bench_output, curve = None):
    measurements = defaultdict(lambda: defaultdict(list))

    # Parse benchmarks and make them ready for fitting
    for measurement in itertools.chain(*bench_output):
        # DEPRECATED: Extra data from json if in table format
        if "Average Time (ns)" in measurement:
            if curve is not None and curve not in measurement["Task Name"]: continue
            operation, size = parse_benchmark_description(measurement["Task Name"], probes)
            measurement_in_ns = measurement["Average Time (ns)"]
            measurements[operation]["range"].append(size)
            measurements[operation]["results"].append(measurement_in_ns)
        else: # if "mean" in measurement:
            if curve is not None and curve not in measurement["name"]: continue
            to_ns = 1000 * 1000
            operation, size = parse_benchmark_description(measurement["name"], probes)
            measurement_in_ns = to_ns * measurement["mean"]
            measurements[operation]["range"].append(size)
            measurements[operation]["results"].append(measurement_in_ns)
            measurements[operation]["stddev"].append(to_ns * measurement["sd"])

    return measurements


def main(ins=[sys.stdin], outs=sys.stdout, curve=None):
    bench_output = [json.loads(line) for i in ins for line in i if line.strip()]
    results = extract_measurements(bench_output, curve)


    if not results:
        # outs.write("{}")
        return False

    # Encode the functions as a JSON object
    json_data = json.dumps(results, indent=2)
    # Write the JSON object to the file
    outs.write(json_data)
    return True

