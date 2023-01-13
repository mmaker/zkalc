import estBls12381ArkM1 from "../data/bls12-381/arkworks/m1pro.json";
import estBls12381ArkT450 from "../data/bls12-381/arkworks/thinkpad_t450.json";
import estBls12381BlstM1 from "../data/bls12-381/blstrs/m1pro.json";
import estBls12381BlstT450 from "../data/bls12-381/blstrs/thinkpad_t450.json";
import estCurve25519DalekM1 from "../data/curve25519/curve25519-dalek/m1pro.json";


export const estimates = {
  curve25519: {
    curve25519_dalek: {
      m1pro: estCurve25519DalekM1
    },
  },
  bls12_381: {
    blstrs: {
      thinkpad_t450: estBls12381BlstT450,
      m1pro: estBls12381BlstM1,
    },
    arkworks: {
      thinkpad_t450: estBls12381ArkT450,
      m1pro: estBls12381ArkM1,
    },
  }
};

// find the line passing through points p and q
const line = ([x1, y1], [x2, y2]) => {
  const m = (y2 - y1) / (x2 - x1);
  const b = y1 - m * x1;
  return [m, b];
};

function linearRegression(x, y) {
  const avgX = x.reduce((prev, curr) => prev + curr, 0) / x.length;
  const xDifferencesToAverage = x.map((value) => avgX - value);
  const xDifferencesToAverageSquared = xDifferencesToAverage.map(
    (value) => value ** 2
  );
  const SSxx = xDifferencesToAverageSquared.reduce(
    (prev, curr) => prev + curr,
    0
  );
  const sumY = y.reduce((prev, curr) => prev + curr, 0);
  const avgY = sumY / y.length;
  const yDifferencesToAverage = y.map((value) => avgY - value);
  const xAndYDifferencesMultiplied = xDifferencesToAverage.map(
    (curr, index) => curr * yDifferencesToAverage[index]
  );
  const SSxy = xAndYDifferencesMultiplied.reduce(
    (prev, curr) => prev + curr,
    0
  );
  const slope = SSxy / SSxx;
  const intercept = avgY - slope * avgX;
  return (x) => intercept + slope * x;
}

const simpleEstimation = (samples) => {
  return (n) => n * samples.results[0];
};

const nLognEstimation = (samples) => {
  return (n) => {
    let { range, results } = samples;
    if (n < range[0] || range[range.length - 1] < n) {
      const xs = range;
      const ys = range.map((x, i) => results[i] * Math.log2(x));
      const extrapolate = linearRegression(xs, ys);
      return extrapolate(n) / Math.log2(n);
    } else {
      let i = 0;
      while (range[i] <= n && i < range.length - 1) {
        i++;
      }
      i--;
      let [p, q] = [
        [range[i], results[i]],
        [range[i + 1], results[i + 1]],
      ];
      const [m, b] = line(p, q);
      return m * n + b;
    }
  };
};

const linearEstimation = (samples) => {
  return (n) => {
    let { range, results } = samples;
    if (n < range[0] || range[range.length - 1] < n) {
      const xs = range;
      const ys = range.map((x, i) => results[i]);
      const extrapolate = linearRegression(xs, ys);
      return extrapolate(n);
    } else {
      let i = 0;
      while (range[i] <= n && i < range.length - 1) {
        i++;
      }
      i--;
      let [p, q] = [
        [samples.range[i], results[i]],
        [samples.range[i + 1], results[i + 1]],
      ];
      const [m, b] = line(p, q);
      return m * n + b;
    }
  };
};

const estimating_functions = {
  default: simpleEstimation,
  msm_G1: nLognEstimation,
  msm_G2: nLognEstimation,
  pairing_product: linearEstimation,
};

export const estimator = (curve, lib, machine, op) => {
  if (!(curve in estimates)) {
    throw new Error(`Curve ${curve} not found`);
  } else if (!(lib in estimates[curve])) {
      throw new Error(`Library ${lib} not found`);
  } else if (!(machine in estimates[curve][lib])) {
    throw new Error(`Machine ${machine} not found`);
  } else if (op in estimates[curve][lib][machine]) {
    let samples = estimates[curve][lib][machine][op];
    let f = estimating_functions[op] || estimating_functions["default"];
    return f(samples);
  } else {
    return (n) => null;
  }
};
