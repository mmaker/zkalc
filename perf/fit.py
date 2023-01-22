#!/usr/bin/env python3
"""
Usage:
    fit.py <(cat coefficients.json | grep Bls12_381) > results.json
"""
import sys
import json
from collections import defaultdict
import re

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

keys = [
    "mul_ff",
    "add_ff",
    "mul_G1",
    "add_G1",
    "mul_G2",
    "add_G2",
    "pairing",
]

probes = {
    # zkalc naming convention
    r'msm/G([12])/(\d+)': lambda x, y: (f"msm_{x}", int(y)),
    r'(mul_ff|add_ff|invert|pairing)': lambda x: (x, 1),
    # simple ec operations are always on G1
    r'add_G1': lambda: ("add_G1", 1),
    r'mul_G1': lambda: ("mul_G1", 1),
                    r'mul_G1': lambda: ("mul_G1", 1),

    # backwards compatibility: pairing_product is msm_gt
    r'pairing_product': lambda: ("msm_gt", 1),
    # compatibility with arkworks ark-bench naming
    f'Arithmetic for .*::(G[12])/({"|".join(ark_names.keys())})': lambda x, y: (f"{ark_names[y]}_{x}", 1),
    r'Arithmetic for .*::Fr/Sum of products of size (\d)': lambda x: (f"ip_ff", int(x)),
    f'Arithmetic for .*::Fr/({"|".join(ark_names.keys())})': lambda y: (f"{ark_names[y]}_ff", 1),
}


def parse_benchmark_description(description):
    # match description against the list of probes
    for probe in probes:
        match = re.match(probe, description)

        if match is not None:
            familiar_name = probes[probe](*match.groups())
            print(f'✅ probe matched {description}', file=sys.stderr)
            return familiar_name
    else:
        print(f"❌ no probe found for '{description}'", file=sys.stderr)
        raise NotImplementedError


def to_nanoseconds(num, unit_str):
    """Convert `num` in `unit_str` to nanoseconds"""
    units = {"ns": 1, "µs": 1e3, "ms": 1e6, "s": 1e9}
    return num * units[unit_str]


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
            operation, size = parse_benchmark_description(measurement["id"])
        except NotImplementedError:
            continue

        measurement_in_ns = to_nanoseconds(
            measurement["mean"]["estimate"], measurement["mean"]["unit"])
        measurements[operation][size] = measurement_in_ns

    return measurements


def dump_benchmarks_to_json(bench_output, file=sys.stdout):
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
    file.write(json_data)


if __name__ == '__main__':
    bench_output = [json.loads(line) for line in sys.stdin]
    dump_benchmarks_to_json(bench_output)
