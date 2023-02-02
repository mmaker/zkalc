#!/usr/bin/env python3
"""
Usage:
    cat sources*.json | grep -i curve_name | ./fit.py > results.json
"""
import sys
import json
from collections import defaultdict

from .common import to_nanoseconds, parse_benchmark_description

ark_names = {
    'Double': 'double',
    'Addition': 'add',
    'Subtraction': 'sub',
    'Scalar Multiplication': 'mul',
    'Negation': 'neg',
    'Inverse': 'inv',
    'Multiplication': 'mul',
    'Square': 'square',
}

op_ids = [
    # scalar field
    "mul_ff",
    "add_ff",
    "msm_ff",
    "invert",

    # G1
    "mul_G1",
    "add_G1",
    "msm_G1",

    # G2
    "mul_G2",
    "add_G2",
    "msm_G2",

    # Gt
    "add_Gt",
    "mul_Gt",
    "pairing",
    "msm_Gt",
]

probes = {
    # zkalc naming convention
    r'.*/msm/(G[12t]|ff)/(\d+)': lambda x, y: (f"msm_{x}", int(y)),
    f'.*/({"|".join(op_ids)})': lambda x: (x, 1),

    # compatibility with arkworks ark-bench naming
    f'Arithmetic for .*::(G[12])/({"|".join(ark_names.keys())})': lambda x, y: (f"{ark_names[y]}_{x}", 1),
    ## ::G should be ::G1
    f'Arithmetic for .*::G/({"|".join(ark_names.keys())})': lambda x: (f"{ark_names[x]}_G1", 1),
    r'Arithmetic for .*::Fr/Sum of products of size (\d)': lambda x: (f"ip_ff", int(x)),

    f'Arithmetic for .*::Fr/({"|".join(ark_names.keys())})': lambda y: (f"{ark_names[y]}_ff", 1),
}

def export_measurement(measurement):
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
            operation, size = parse_benchmark_description(measurement["id"], probes)
        except NotImplementedError:
            continue

        measurement_in_ns = to_nanoseconds(
            measurement["mean"]["estimate"], measurement["mean"]["unit"])
        measurements[operation][size] = measurement_in_ns

    return measurements


def main(ins=sys.stdin, outs=sys.stdout):
    bench_output = [json.loads(line) for line in sys.stdin if line.strip()]
    # Dictionary of results in format: { operation : measurements }
    results = {}
    # Extract measurements into a nested dictionary: { operation : {size : time_in_microseconds }}
    measurements = extract_measurements(bench_output)
    # Re-format the measurements into a dictionary: {operation : {range: [sizes], results: [times]}
    results = {operation: export_measurement(
        measurements[operation]) for operation in measurements}

    # Encode the functions as a JSON object
    json_data = json.dumps(results)
    # Write the JSON object to the file
    outs.write(json_data)

