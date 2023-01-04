# zkalc is a cryptographic calculator!

zkalc helps you calculate how much time cryptographic operations will take in a real computer

## Why?

We noticed that cryptographers tend to be good at cryptography but they can be quite bad at estimating the time it takes a computer to run their protocol. That creates a gap between cryptography and practice because protocol designers have a hard time estimating whether a construction is practical or not.

The premise of zkalc is that a simple calculator UX might motivate cryptographers to add more real life into their papers!

## How?

zkalc does not aim to be accurate; it aims to be simple to use while providing adequate results.

Our *scientific methodology* is simple:
- For non-amortized operations like field addition and multiplication we simply use the benchmark results in a linear fashion. That is, if a single operation takes $x$ seconds, $n$ such operations will take $n*x$ seconds.
- For amortized operations like MSMs and pairing products, we collect benchmarks for different operation sizes and then perform polynomial interpolation over the data points. We use the resulting polynomials to answer the user's queries.

Yes, our techniques are based on approximations. On heuristics. But maybe that's good enough for now. If you want to work on a better approach, please get in touch :)

## Ugh!

### A library/curve that I want is missing!

If a library/curve/operation that you care about is missing, please open a PR!

Please perform the following steps to add your own functionality:
- Write benchmarks for your library/curve/operation in the `backend` directory following the already existing conventions
- Your benchmarks must output a JSON file that `perf/fit.py` can understand (it currently understands the format of criterion's `estimates.json`)
- Run your benchmarks and move their `output.json` to the `perf/` directory
- Run `python perf/fit.py perf/output.json` and move the `coefficients.json` output file to the `frontend/src/` directory
- Follow the conventions of `frontend/src/App.js` to include your results to the website.

If the above is too involved, just do the three top steps and submit a PR with your benchmark results and we can take care of the rest.


