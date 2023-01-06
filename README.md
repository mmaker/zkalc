# zkalc is a cryptographic calculator!

zkalc helps you calculate how much time cryptographic operations will take in a real computer

## Why does zkalc exist?

We noticed that cryptographers tend to be good at cryptography but they can be quite bad at estimating the time it takes a computer to run their protocol. That creates a gap between cryptography and practice because protocol designers have a hard time estimating whether a construction is practical or not.

The premise of zkalc is that a simple calculator UX might motivate cryptographers to add more real life into their papers!

## How does zkalc work?

zkalc does not aim to be accurate; it aims to be simple to use while providing adequate results.

Our *scientific methodology* is simple:
- For each supported operation, we write a benchmark that measures its performance on the various libraries supported.
- For basic operations like field addition and multiplication we use the benchmark output in a linear fashion. That is, if a single operation takes $x$ seconds on average, $n$ such operations take $n*x$ seconds.
- For more complicated operations like MSMs, we collect benchmarks for different operation sizes and then perform polynomial interpolation over the data points. We use the resulting polynomials to answer the user's queries. For user queries outside of the interpolation range we extrapolate using a linear function (see TODO.md for possible improvements here).

Yes, our techniques are based on approximations. On heuristics. That's usually good enough when designing protocols. For more precise results, actual robust benchmarks of the desired size must be run.

Please see the TODO.md file for future zkalc directions.

## Ugh!

### I want a library/curve/operation/machine but it's missing!

If something is missing, please open a PR!

Perform the following steps to add the missing benchmarks:
- If needed, write the benchmarks for the missing library/curve/operation in the `backend/` directory following the already existing conventions
  - If you write non-Rust benchmarks, they must output a JSON file that `perf/fit.py` can understand (it currently understands the format of criterion's `estimates.json`)
- Run your benchmarks on the desired machine and move their `output.json` to the `perf/` directory.

Now submit a PR with the above and the specs of your machine and we will take care of the rest!
