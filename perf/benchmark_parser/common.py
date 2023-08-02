import re
import sys

def parse_benchmark_description(description, probes):
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

def export_measurement(measurement):
    """Export this measurement in json"""
    # Get the sizes and times from the data
    sizes, times = zip(*measurement.items())
    return {"range": sizes, "results": times}

def to_nanoseconds(num, unit_str):
    """Convert `num` in `unit_str` to nanoseconds"""
    units = {"ns": 1, "µs": 1e3, "ms": 1e6, "s": 1e9}
    return num * units[unit_str]


