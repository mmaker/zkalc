# ffiasm

## Arithmetics and elliptic curves benchmarks

Benchmarks for the [ffiasm](https://github.com/iden3/ffiasm) library 
using [nanobench](https://github.com/martinus/nanobench).

**NOTE**: This benchmark can only run in Intel64 machines.


## Instructions

If you want to run the benchmarks for Arithmetics and EC then you need to 
execute the following command inside `ffiasm` directory to download the
required library.

```
npm i
```

Furthermore, you should also install lib gmp and nasm.

* Linux (ubuntu)

```
apt install libgmp-dev nasm 
```

* Mac 

```
brew install gmp nasm 
```

```
./scripts/bench.js > results.json
```

The first time you run this command will take a while (a few minutes) to first 
compile nanobench
