# TODO

Here is a bunch of stuff we could add to zkalc in the future:

- **Add singlethreaded benchmarks**
- **Improve UI**: make it easier to compare performance of different machines or libraries
- **Benchmark more operations**
  - Batch inversion
  - Barycentric evaluation
  - Sumcheck
- **extend supportedlibraries**:
  - [gnark](https://github.com/ConsenSys/gnark)
  - [constantine](https://github.com/mratsim/constantine)
  - [miracl](https://github.com/miracl/core)
  - [relic](https://github.com/relic-toolkit/relic)
  - go postquantum?
- **Going beyond microbenchmarks**
  - Add some primitives like [Naor–Reingold](https://en.wikipedia.org/wiki/Naor%E2%80%93Reingold_pseudorandom_function)
  - Calculate proof sizes
  - Calculate number of constraints (e.g. for sha256, sha3, poseidon)
- **Support new functions**
  - Fp: Square, Sqrt
  - G1/2: Subgroup membership check, cofactor clearing
  - GT: Square (cyclotomic), MSM
