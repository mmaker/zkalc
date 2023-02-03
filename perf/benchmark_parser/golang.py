#!/usr/bin/env python
import json
import re, io, sys
from collections import OrderedDict, defaultdict

from .common import to_nanoseconds, parse_benchmark_description

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
    r'ElementAdd':                    lambda:   ("add_ff", 1),
    r'ElementMul':                    lambda:   ("mul_ff", 1),
    r'ElementInverse':                lambda:   ("invert", 1),

    r'G1JacAdd':                      lambda:   ("add_G1", 1),
    r'G1JacScalarMultiplication':     lambda:   ("mul_G1", 1),
    r'MultiExpG1/(\d+)_points':       lambda x: ("msm_G1", int(x)),

    r'G2JacAdd':                      lambda:   ("add_G2", 1),
    r'G2JacScalarMultiplication':     lambda:   ("mul_G2", 1),
    r'MultiExpG2/(\d+)_points':       lambda x: ("msm_G2", int(x)),
    r'E12Add':                        lambda:  ("add_Gt", 1),
    r'E12Mul':                        lambda:  ("mul_Gt", 1),
    r'Pairing':                       lambda:  ("pairing", 1),
    r'MultiPair/(\d+)_pairs':         lambda x: ("msm_Gt", int(x)),
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
def main(ins=sys.stdin, outs=sys.stdout):
    benchmarks, labels = load_benchmarks(ins)
    measurements = extract_measurements(benchmarks)

    # Re-format the measurements into a dictionary: {operation : {range: [sizes], results: [times]}
    results = {operation: export_measurement(measurements[operation]) for operation in measurements}

    # Encode the functions as a JSON object
    json_data = json.dumps(results)
    # Write the JSON object to the file
    outs.write(json_data)

