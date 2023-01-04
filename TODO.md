# TODO

Here is a bunch of stuff we could add to zkalc in the future:

## Improve accuracy of results

Currently our extrapolation strategy is quite sloppy which results in bad results for big inputs. For operations like MSMs whose complexity is generally known we can do better fitting by using the fact that the final function should look like `p(x)/logx`.

## Benchmark more operations:
- FFTs
- Barycentric evaluation


## Benchmark more libraries:
- gnark
- halo2 / zkcrypto
- constantine

## Benchmark more curves

## Add more features
- Calculate proof sizes
- Calculate number of constraints (e.g. for poseidon)

