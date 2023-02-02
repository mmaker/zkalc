#!/usr/bin/env python
import argparse
import json
import re, io, sys
from collections import OrderedDict, defaultdict

from common import to_nanoseconds, parse_benchmark_description

def parse_benchline(line):
    """
    Return (benchmark_name, iterations, time_in_nanoseconds) for a benchmark, or None if invalid.
    """
    if not line.startswith('Benchmark'):
        return None
    line = line[9:]

    line = line.split()
    if len(line) < 4:
        return None

    name  = line[0]
    iterations = int(line[1])

    tail = line[2:]
    if len(tail) < 2:
        return None

    value, unit = tail[:2]
    tail = tail[2:]

    value = float(value)
    unit = unit.split("/")[0]

    return name, iterations, to_nanoseconds(value, unit)

def load_benchmarks(f):
    labels = {}
    benchmarks = []

    # For each line, attempt to read a benchmark
    for line in f.readlines():
        bl = parse_benchline(line)
        if bl is not None:
            benchmarks.append(bl)
            continue

    return benchmarks, labels

probes = {
    r'MultiExpG1/(\d+)_points': lambda x: (f"msm_G1", int(x)),
    r'MultiExpG2/(\d+)_points': lambda x: (f"msm_G2", int(x)),
    r'MultiPair/(\d+)_pairs-8': lambda x: (f"msm_Gt", int(x)),
    r'(mul_ff|add_ff|invert|Pairing)': lambda x: (x, 1),
    r'add_ec': lambda: ("add_G1", 1),
    r'mul_ec': lambda: ("mul_G1", 1),

}

def export_measurement(measurement):
    """Export this measurement in json"""
    # Get the sizes and times from the data
    sizes, times = zip(*measurement.items())
    return {"range": sizes, "results": times}

def extract_measurements(benchmarks):
    measurements = defaultdict(dict)

    for benchline in benchmarks:
        try:
            operation, size = parse_benchmark_description(benchline[0], probes)
        except NotImplementedError:
            continue

        measurements[operation][size] = benchline[2]

    return measurements

# if invoked as main just print statistics
def dump_benchmarks_to_json(file=sys.stdout):
    benchmarks, labels = load_benchmarks(sys.stdin)
    measurements = extract_measurements(benchmarks)

    # Re-format the measurements into a dictionary: {operation : {range: [sizes], results: [times]}
    results = {operation: export_measurement(measurements[operation]) for operation in measurements}

    # Encode the functions as a JSON object
    json_data = json.dumps(results)
    # Write the JSON object to the file
    file.write(json_data)

if __name__ == '__main__':
    dump_benchmarks_to_json()
