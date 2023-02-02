This folder contains all raw benchmarks results and is meant to be handled by zkalc's maintainers.
Check the [AUTHORS](../AUTHORS) file for contact information.

For now, know that the `fit.py` file is used with some bash kung-fu like

```bash
    $ cat data/new/ark* | grep -i bls12_381 | ./parse_rust_benches.py > results.json
```
