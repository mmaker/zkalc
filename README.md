# [zkalc](https://zka.lc) is a cryptographic calculator!

[zkalc](https://zka.lc) helps you calculate how much time cryptographic operations take on a real computer.
If you use our software, consider [citing us](/CITATION.bib)!


## Why?

Cryptographers tend to be good at cryptography but they can be quite bad at estimating the time it takes a computer to run their schemes.

We hope that zkalc can help shorten the gap between cryptography and practice:
- Cryptographers can use the simple zkalc UX to learn how fast their paper will run on various machines
- Protocol designers can more easily tune the parameters of their protocol depending on their requirements

Please see the various pages of [the website](https://zka.lc) for more information on how zkalc works.

## Prerequisites

To run benchmarks, we assume that `make`, `git`, `rust` (**nightly!**) and `go` (**> 1.17**) are installed in the system.

**Installing Go.** To install `go`, you can download the binaries at [go.dev/dl](https://go.dev/dl/) and add `go/bin` to your `PATH` environment variable.

**Installing Rust.** To install rust, you can follow [rustup.rs](https://rustup.rs/) and then type `rustup default nightly`.

## Benchmarks

All benchmarks are listed and run inside the `benchmarks/` folder. To run them, type:

```bash
    $ cd backend
    $ make
```
The files generated will end up stored in `perf/data/new/`

## Processing Benchmarks

For this step, we require `python3`. Benchmarks are assumed to be in a parent folder called `bench-data` resembling [our raw data repository](https://github.com/zkCollective/bench-data).

```bash
    $ cd perf
    $ make
```

## Fronted development
To develop the frontend, `npm` is required.
Run:

```bash
    $ cd frontend
    $ npm i
    $ npm run dev
```

To start a local development server


## Acknowledgements

We thank [NLnet](https://nlnet.nl), who supported part of this work via the [NGI0 Entrust](https://nlnet.nl/entrust) fund. 

