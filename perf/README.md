This folder contains parsers for benchmarks from https://github.com/zkCollective/bench-data/.

To parse them, run:

```bash
    $ python3 -m benchmark_parser ../../bench-data
    $ find ../frontend/data -empty -delete  # remove empty files without benchmarks
```
