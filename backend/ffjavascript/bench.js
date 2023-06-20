#!/usr/bin/env node

// Measuring elliptic curve operations for ffjavascript
import { BigBuffer, buildBn128, buildBls12381, F1Field } from "ffjavascript";
import { Bench } from "tinybench";

const curves = [
  buildBls12381(false).then((curve) => {
    curve.name = "bls12_381";
    return curve;
  }),
  buildBn128(false),
];

function bench_add_ff(F) {
  const x = F.random();
  const y = F.random();
  return () => {
    F.add(x, y);
  };
}

function bench_invert(F) {
  const x = F.random();
  return () => {
    F.invert(x);
  };
}

function bench_add_ec(G, Fr) {
  const x = G.timesScalar(G.g, Fr.random());
  const y = G.timesScalar(G.g, Fr.random());
  return () => {
    G.add(x, y);
  };
}

function bench_mul_ec(G, Fr) {
  const x = G.F.random();
  const y = G.timesScalar(G.g, Fr.random());
  return () => {
    G.timesScalar(y, x);
  };
}

function bench_pairing(curve) {
  const x = curve.Fr.random();
  const y = curve.Fr.random();
  const g1 = curve.G1.timesScalar(curve.G1.g, x);
  const g2 = curve.G2.timesScalar(curve.G2.g, y);
  return () => {
    const pre1 = curve.prepareG1(g1);
    const pre2 = curve.prepareG2(g2);
    const r1 = curve.millerLoop(pre1, pre2);
    const r2 = curve.finalExponentiation(r1);
  };
}

function bench_group(bench, name, fn, range) {
  for (var i = range[0]; i < range[1]; i++) {
    bench.add(name + "/" + i, fn(i));
  }
}

function bench_fft(F) {
  return (_n) => {
    const n = Math.pow(2, _n);
    const x = new BigBuffer(n * F.n8);
    for (let i = 0; i < n; i++) {
      x.set(F.random(), i * F.n8);
    }
    return () => {
      F.fft(x);
    };
  };
}

function bench_msm(G, Fr) {
  return async (_n) => {
    // size is log-scale
    let n = Math.pow(2, _n);
    const scalars = new BigBuffer(n * Fr.n8);
    const bases = new BigBuffer(n * G.F.n8 * 2);
    for (let i = 0; i < n; i++) {
      scalars.set(Fr.random(), i * Fr.n8);
      bases.set(G.toAffine(G.timesFr(G.g, Fr.random())), i * G.F.n8 * 2);
    }
    await G.multiExpAffine(bases, scalars, false, "");
  };
}

async function run() {
  const bench = new Bench();

  for (const curve of curves) {
    const c = await curve;

    bench
      .add(c.name + "/add_ff", bench_add_ff(c.Fr))
      .add(c.name + "/invert", bench_invert(c.Fr))
      .add(c.name + "/mul_G1", bench_mul_ec(c.G1, c.Fr))
      .add(c.name + "/mul_G2", bench_mul_ec(c.G2, c.Fr))
      .add(c.name + "/pairing", bench_pairing(c))
      .add(c.name + "/add_G1", bench_add_ec(c.G1, c.Fr))
      .add(c.name + "/add_G2", bench_add_ec(c.G2, c.Fr));

    bench_group(bench, c.name + "/msm_G1", bench_msm(c.G1, c.Fr), [10, 21]);
    bench_group(bench, c.name + "/msm_G2", bench_msm(c.G2, c.Fr), [10, 21]);
    bench_group(bench, c.name + "/fft", bench_fft(c.Fr), [10, 21]);
  }

  await bench.run();
  // console.table(bench.table());
  process.stdout.write(JSON.stringify(bench.table()));
  return bench.results;
}

run().then(() => {
  process.exit(0);
});
