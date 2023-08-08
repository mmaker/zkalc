#!/usr/bin/env python3

import sys
import json
from collections import defaultdict

from .common import to_nanoseconds, parse_benchmark_description, export_measurement

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

    # compatibility with arkworks ark-bench naming
    f'Arithmetic for .*::(G[12])/({"|".join(ark_names.keys())})': lambda x, y: (f"{ark_names[y]}_{x}", 1),
    # ::G should be ::G1
    f'Arithmetic for .*::G/({"|".join(ark_names.keys())})': lambda x: (f"{ark_names[x]}_G1", 1),
    r'Arithmetic for .*::Fr/Sum of products of size (\d)': lambda x: (f"ip_ff", int(x)),

    f'Arithmetic for .*::Fr/({"|".join(ark_names.keys())})': lambda y: (f"{ark_names[y]}_ff", 1),
}


def stddev(bench):
    iterations = bench["iteration_count"]
    samples = bench["measured_values"]
    average = to_nanoseconds(bench["mean"]["estimate"], bench["mean"]["unit"])
    averages = [to_nanoseconds(x/y, bench["unit"]) for x, y in zip(samples, iterations)]
    return (sum((x - average)**2 for x in averages) / len(averages))**.5


def extract_measurements(bench_output):
    measurements = defaultdict(lambda: defaultdict(list))

    # Parse benchmarks and make them ready for fitting
    for bench in bench_output:
        # Skip useless non-benchmark lines
        if "id" not in bench:
            continue

        # Extra data from json
        try:
            id = bench["id"]
            operation, size = parse_benchmark_description(id, probes)
        except NotImplementedError:
            continue

        measurement_in_ns = to_nanoseconds(bench["mean"]["estimate"], bench["mean"]["unit"])
        stddev_in_ns = stddev(bench)
        measurements[operation]["range"].append(size)
        measurements[operation]["results"].append(measurement_in_ns)
        measurements[operation]["stddev"].append(stddev_in_ns)

    return measurements


def main(ins=[sys.stdin], outs=sys.stdout, curve=None):
    bench_output = [json.loads(line) for i in ins for line in i if line.strip() and (
        curve is None or curve.lower() in line.lower())]
    if not bench_output:
        # outs.write("{}")
        return False
    # Dictionary of results in format: { operation : measurements }
    results = {}
    # Extract measurements into a nested dictionary: { operation : {size : time_in_microseconds }}
    measurements = extract_measurements(bench_output)

    # Encode the functions as a JSON object
    json_data = json.dumps(measurements, indent=2)
    # Write the JSON object to the file
    outs.write(json_data)
    return True
