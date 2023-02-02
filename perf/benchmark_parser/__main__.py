import argparse

from . import criterion
from . import golang


def main():
    parser = argparse.ArgumentParser(prog="parser")
    parser.add_argument('benchmark_engine', choices=['criterion', 'golang'])
    args = parser.parse_args()
    if args.benchmark_engine == 'criterion':
        criterion.main()
    else:
        golang.main()


if __name__ == '__main__':
    main()
