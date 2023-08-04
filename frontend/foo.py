import csv
import json
import sys

results = [row for row in csv.DictReader(sys.stdin)]
print(json.dumps(results, indent=2), file=sys.stdout)

