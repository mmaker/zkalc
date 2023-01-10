# [zkalc](https://zka.lc) is a cryptographic calculator!

[zkalc](https://zka.lc) helps you calculate how much time cryptographic operations take on a real computer

## Why?

Cryptographers tend to be good at cryptography but they can be quite bad at estimating the time it takes a computer to run their schemes.

We hope that zkalc can help shorten the gap between cryptography and practice:
- Cryptographers can use the simple zkalc UX to learn how fast their paper will run on various machines
- Protocol designers can more easily tune the parameters of their protocol depending on their requirements

Please see the various pages of [the website](https://zka.lc) for more information on how zkalc works.

## Codebase Structure

- `backend/` is the directory with all the benchmarks
- `frontend/` is the directory with the website (do `npm install` and then `npm run dev` to start it locally)
- `perf/` is the directory with the curve fitting logic

Enjoy!
