# zkalc is a cryptographic calculator!

zkalc helps cryptographers calculate how much time cryptographic operations take in real computers.

## Why?

We noticed that cryptographers tend to be reasonably good at cryptography but they can also be quite bad at estimating how long certain operations will take in actual computers. That creates a gap between cryptography and practice because cryptography engineers have a hard time estimating whether a construction is practical or not.

The permise of zkalc is that a simple calculator UX might motivate cryptographers to add more real life context into their papers!

## How?

zkalc does not aim to be accurate; it aims to be simple to use while providing adequate results.

Our scientific methodology is simple: For each operation present in zkalc, we have written benchmarks in the directory
`backend`. Benchmarks are run and then we fit the results into a simple function using linear regression. When a
cryptographer uses zkalc, we compute the fitted function to the desired input and present the result.

Of course this is just an approximation. A heuristic. But maybe it's good enough for now. If you have a better idea on how to do this, please get in touch :)

## Ugh!

### A library/curve that I want is missing!

If a library/curve/operation that you care about is missing, please open a PR! Adding it is actually not that hard.

What you need to do is:
- Write benchmarks for it in the `backend` directory
- All benchmarks must output a JSON file that `perf/fit.py` can understand (it currently understands the format of criterion's `estimates.json`)
- Run `python perf/fit.py output.json` and move the `coefficients.json` output file to the `frontend` directory
- Adapt the `frontend` code to include your modification



