#!/usr/bin/env node

// Measuring elliptic curve operations for ffjavascript
import { BigBuffer, buildBn128, buildBls12381, F1Field } from "ffjavascript";
import { Bench } from "tinybench";

const curves = [buildBn128(false), buildBls12381(false)];

function bench_add_ff(F) {
  const x = F.random();
  const y = F.random();
  return () => {
    F.add(x, y);
  };
}

function bench_mul_ff(F) {
  const x = F.random();
  const y = F.random();
  return () => {
    F.mul(x, y);
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
    curve.pairing(g1, g2);
  };
}

function bench_fft(bench, name, F, range) {
  for (var i = range[0]; i < range[1]; i++) {
    const n = Math.pow(2, i);
    const x = new BigBuffer(n * F.n8);
    for (let i = 0; i < n; i++) {
      x.set(F.random(), i * F.n8);
    }
    bench.add(name + "/" + n, async () => {
      await F.fft(x);
    });
  }
}

function bench_msm(bench, name, G, Fr, range) {
  for (var i = range[0]; i < range[1]; i++) {
    let n = Math.pow(2, i);
    const scalars = new BigBuffer(n * Fr.n8);
    const bases = new BigBuffer(n * G.F.n8 * 2);
    for (let i = 0; i < n; i++) {
      scalars.set(Fr.random(), i * Fr.n8);
      bases.set(G.toAffine(G.timesFr(G.g, Fr.random())), i * G.F.n8 * 2);
    }
    bench.add(name + "/" + n, async () => {
      await G.multiExpAffine(bases, scalars, false, "");
    });
  }
}

async function run() {
  const bench = new Bench();

  for (const curve of curves) {
    const c = await curve;
    // If we do not do it like that, then the pairing operation does not work
    // properly.
    let name = c.name;
    if (name == "bls12381") {
      name = "bls12_381";
    }
    if (name == "bn128") {
      name = "bn254";
    }

    bench
      .add(name + "/add_ff", bench_add_ff(c.Fr))
      .add(name + "/mul_ff", bench_mul_ff(c.Fr))
      .add(name + "/invert", bench_invert(c.Fr))
      .add(name + "/mul_G1", bench_mul_ec(c.G1, c.Fr))
      .add(name + "/mul_G2", bench_mul_ec(c.G2, c.Fr))
      .add(name + "/pairing", bench_pairing(c))
      .add(name + "/add_G1", bench_add_ec(c.G1, c.Fr))
      .add(name + "/add_G2", bench_add_ec(c.G2, c.Fr));

    bench_msm(bench, name + "/msm_G1", c.G1, c.Fr, [1, 21]);
    bench_msm(bench, name + "/msm_G2", c.G2, c.Fr, [1, 21]);
    bench_fft(bench, name + "/fft", c.Fr, [1, 21]);
  }

  await bench.run();
  console.table(bench.table());
  const results = bench.tasks.map((x) => {
    // remove samples to avoid the dataset from exploding
    let { ["samples"]: unused, ...info } = x.result;
    return { name: x.name, ...info };
  });
  process.stderr.write(JSON.stringify(results));
}

run().then(() => {
  process.exit(0);
});
