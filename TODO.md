# TODO

Here is a bunch of stuff we could add to zkalc in the future:

- **Improve result accuracy**: we are not statisticians, we are not sure the methodology is really sound and standard.
- **Add singlethreaded benchmarks**
- **Benchmark more operations**
  - FFTs
  - Batch inversion
  - Barycentric evaluation
  - Sumcheck
  - Sum of products of field elements
- **extend supportedlibraries **:
  - [gnark](https://github.com/ConsenSys/gnark)
  - [zkcrypto](https://github.com/zcash/halo2)
  - [constantine](https://github.com/mratsim/constantine)
  - [miracl](https://github.com/miracl/core)
  - [relic](https://github.com/relic-toolkit/relic)
- **Going beyond microbenchmarks**
  - Add some primitives like [Naor–Reingold](https://en.wikipedia.org/wiki/Naor%E2%80%93Reingold_pseudorandom_function)
  - Calculate proof sizes
  - Calculate number of constraints (e.g. for sha256, sha3, poseidon)

