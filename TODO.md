# TODO

Here is a bunch of stuff we could add to zkalc in the future:

## Improve result accuracy

Currently our extrapolation strategy is quite sloppy which results in bad results for inputs out of range. For operations like MSMs whose complexity is generally known, we can do better fitting by using the fact that the final function should behave like `p(x)/logx`.

## Also add singlethreaded benchmarks

## Benchmark more operations:

- FFTs
- Batch inversion
- Barycentric evaluation
- Sumcheck
- Sum of products

## Benchmark more libraries:

- gnark
- zkcrypto
- constantine

## Add more features
- Calculate proof sizes
- Calculate number of constraints (e.g. for poseidon)

