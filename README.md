# zkalc is a cryptographic calculator!

zkalc helps you calculate how much time cryptographic operations take on a real computer

## Why?

Cryptographers tend to be good at cryptography but they can be quite bad at estimating the time it takes a computer to run their schemes.

We hope that zkalc can help shorten the gap between cryptography and practice:
- Cryptographers can use the simple zkalc UX to learn how fast their paper will run on various machines
- Protocol designers can more easily tune the parameters of their protocol depending on their requirements

## How does zkalc work?

zkalc is not 100% accurate; it aims to be easy to use while providing adequate results.

The *scientific methodology* is simple:
- For each supported operation, we write a benchmark that measures its performance.
- For basic operations like field addition and multiplication we use the benchmark results in a linear fashion. That is, if a single operation takes `x` seconds on average, `n` such operations take `n*x` seconds.
- For more complicated operations like MSMs, we run benchmarks for different input sizes and then perform polynomial interpolation over the benchmark results. We use the interpolated polynomials to answer the user's queries. For user queries outside of the interpolation range we extrapolate using a linear function (see TODO.md for possible improvements here).

Yes, our techniques are based on approximations. On heuristics. That's usually good enough when designing protocols. For more precise results, actual robust benchmarks of the desired size must be run.

There is still lots of ways we can improve zkalc. Please check [the TODO file](./TODO.md) to see how you can also help!

## I need a library/curve/operation/machine but it's missing!

If something you need is missing, please help us add it!

Perform the following steps to add any missing benchmarks:
- If new benchmarks are needed, write code for them in the `backend/` directory following the already existing conventions
  - If you write non-Rust benchmarks, they must output a JSON file that `perf/fit.py` can understand (it currently understands the format of criterion's `estimates.json`)
- Run your benchmarks on the desired machine and move their `output.json` to the `perf/` directory.

Finally, submit a PR with the above mentioning the specs of your machine and we will take care of the rest!
