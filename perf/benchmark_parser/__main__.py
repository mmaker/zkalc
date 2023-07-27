import argparse
import re
import sys
import json
import os.path


from . import criterion
from . import golang


parsers = {
    'criterion': criterion.main,
    'golang': golang.main,
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

    for curve in curves:
        for library in libraries:
            for machine in machines:
                # create folder
                try:
                    os.makedirs(os.path.join(dest_dir, curve, library))
                except FileExistsError:
                    pass

                current_folder = os.path.join(benchmark_path, machine, library, '')
                benchmark_files = [current_folder + x for x in os.listdir(current_folder)]
                for benchmark_file in benchmark_files:
                    if not os.path.isfile(benchmark_file):
                        continue
                    print("found: ", benchmark_file, file=sys.stderr)
                    benchmark_engine = parsers[libraries[library]['benchmark_with']]

                    ins = (x for x in open(benchmark_file) if curve.lower() in x.lower())
                    outs = open(os.path.join(dest_dir, curve, library, machine + '.json'), 'w+')

                    benchmark_engine(ins, outs)

    # pattern = re.compile(args.filter)
    # ins = (line for line in sys.stdin if pattern.match(line))

    # if args.benchmark_engine == 'criterion':
        # criterion.main(ins)
    # else:
        # golang.main(ins)


if __name__ == '__main__':
    main()
