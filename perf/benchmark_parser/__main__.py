import argparse
import re
import sys
import json
import os.path
from collections import defaultdict
from itertools import chain


from . import criterion
from . import golang
from . import tinybench


parsers = {
    'criterion': criterion.main,
    'golang': golang.main,
    'tinybench': tinybench.main,
}

def main():
    parser = argparse.ArgumentParser(prog="parser")
    # parser.add_argument('-f', '--filter', default='.*', help='Regex filter for benchmarks')
    parser.add_argument('dir', nargs='?', default=os.getcwd())
    args = parser.parse_args()

    base_dir = args.dir
    benchmark_path = os.path.join(base_dir, 'math')

    libraries = json.load(open(os.path.join(base_dir, 'libraries.json')))
    machines = json.load(open(os.path.join(base_dir, 'machines.json')))
    curves = json.load(open(os.path.join(base_dir, 'curves.json')))

    dest_dir = os.path.join('..', 'frontend', 'data')
    estimates = defaultdict(lambda: defaultdict(dict))

    for curve in curves:
        for library in libraries:
            for machine in machines:
                # create folder
                try:
                    os.makedirs(os.path.join(dest_dir, curve, library))
                except FileExistsError:
                    pass

                current_folder = os.path.join(benchmark_path, machine, library, '')
                output_path = os.path.join(dest_dir, curve, library, machine + '.json')

                benchmark_engine = parsers[libraries[library]['benchmark_with']]
                print("ℹ Parsing " + current_folder, file=sys.stderr)
                # read all elements, but exclude data points for control and testing
                benchmark_files = [open(current_folder + x) for x in os.listdir(current_folder)
                                   if '-control' not in x]
                outs = open(output_path, 'w+')

                if benchmark_engine(benchmark_files, outs, curve):
                    print('Parsed ' + output_path, file=sys.stderr)
                    estimates[curve][library][machine] = os.path.join(curve, library, machine + '.json')
                # else:
                    # print(f"❗️ no output found: {benchmark_files} and curve {curve}", file=sys.stderr)

    else:
        with open(os.path.join(dest_dir, 'estimates.json'), 'w+') as estimates_file:
            print(json.dumps(estimates, indent=4, sort_keys=True), file=estimates_file)
        with open(os.path.join(dest_dir, 'libraries.json'), 'w+') as libraries_file:
            print(json.dumps(libraries, indent=4, sort_keys=True), file=libraries_file)
        with open(os.path.join(dest_dir, 'machines.json'), 'w+') as machines_file:
            print(json.dumps(machines, indent=4, sort_keys=True), file=machines_file)
        with open(os.path.join(dest_dir, 'curves.json'), 'w+') as curves_file:
            print(json.dumps(curves, indent=4, sort_keys=True), file=curves_file)



if __name__ == '__main__':
    main()
