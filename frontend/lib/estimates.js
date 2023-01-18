import estBls12381ArkM1 from "../data/bls12-381/arkworks/m1pro.json";
import estBls12381ArkT450 from "../data/bls12-381/arkworks/thinkpad_t450.json";
import estBls12381ArkEc2C59xlarge from "../data/bls12-381/arkworks/aws_c5_9xlarge.json";
import estBls12381BlstM1 from "../data/bls12-381/blstrs/m1pro.json";
import estBls12381BlstT450 from "../data/bls12-381/blstrs/thinkpad_t450.json";
import estBls12381BlstEc2C59xlarge from "../data/bls12-381/blstrs/aws_c5_9xlarge.json";
import estCurve25519DalekM1 from "../data/curve25519/curve25519-dalek/m1pro.json";
import estCurve25519DalekT450 from "../data/curve25519/curve25519-dalek/t450.json";
import estBls12377ArkM1 from "../data/bls12-377/arkworks/m1pro.json";
// import estBls12377ArkT450 from "../data/bls12-377/arkworks/thinkpad_t450.json";


/// how many elements to keep for regression.
const regressionSet = 4;

export const estimates = {
  curve25519: {
    curve25519_dalek: {
      m1pro: estCurve25519DalekM1,
      thinkpad_t450: estCurve25519DalekT450,
    },
  },
  bls12_381: {
    blstrs: {
      thinkpad_t450: estBls12381BlstT450,
      m1pro: estBls12381BlstM1,
      ec2c59xlarge: estBls12381BlstEc2C59xlarge,
    },
    arkworks: {
      thinkpad_t450: estBls12381ArkT450,
      m1pro: estBls12381ArkM1,
      ec2c59xlarge: estBls12381ArkEc2C59xlarge,
    },
  },
  bls12_377: {
    arkworks: {
      // thinkpad_t450: estBls12377ArkT450,
      m1pro: estBls12377ArkM1,
    },
  },
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
    if (n > range[range.length - 1]) { // extrapolate to the right (do regression)
      const xs =
        n < range[0]
          ? range.slice(0, regressionSet)
          : range.slice(-regressionSet);
      let ys =
        n < range[0]
          ? results.slice(0, regressionSet)
          : results.slice(-regressionSet);
      ys = ys.map((x) => x * Math.log2(n));
      const extrapolate = linearRegression(xs, ys);
      return extrapolate(n) / Math.log2(n);
    } else if (n < range[0]) { // extrapolate to the left (use the first lagrange poly)
      let [p, q] = [
        [range[0], results[0]],
        [range[1], results[1]],
      ];
      const [m, b] = line(p, q);
      return m * n + b;
    } else { // interpolate within benchmark bounds (find the right lagrange poly)
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
      const xs =
        n < range[0]
          ? range.slice(0, regressionSet)
          : range.slice(-regressionSet);
      const ys =
        n < range[0]
          ? results.slice(0, regressionSet)
          : results.slice(-regressionSet);
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
