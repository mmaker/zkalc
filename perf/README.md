This folder contains all raw benchmarks results and is meant to be handled by zkalc's maintainers.
Check the [AUTHORS](../AUTHORS) file for contact information.

For now, you can do something like:

```bash
    $ cat data/new/ark* | grep -i bls12_381 | python -m benchmark_parser criterion > results.json
```
