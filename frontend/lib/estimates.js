import estBls12381ArkM1 from "../data/bls12-381/arkworks/m1pro.json";
import estBls12381ArkT450 from "../data/bls12-381/arkworks/t450.json";
import estBls12381BlstM1 from "../data/bls12-381/blstrs/m1pro.json";
import estBls12381BlstT450 from "../data/bls12-381/blstrs/t450.json";

export const estimates = {
  blstrs: {
    bls12_381: {
      thinkpad_t450: estBls12381BlstT450,
      m1pro: estBls12381BlstM1,
    },
  },
  arkworks: {
    bls12_381: {
      thinkpad_t450: estBls12381ArkT450,
      m1pro: estBls12381ArkM1,
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

export const estimator = (samples, n) => {
  let range = samples.range;

  if (range.length === 1) {
    return n * samples.results[0];
  } else if (range[0] > n || range[range.length - 1] < n) {
    const xs = range;
    const ys = range.map((x, i) => samples.results[i] * Math.log2(x));
    const extrapolate = linearRegression(xs, ys);
    return extrapolate(n);
  } else {
    let i = 0;
    while (range[i] <= n && i < range.length - 1) {
      i++;
    }
    i--;
    let [p, q] = [
      [samples.range[i], samples.results[i]],
      [samples.range[i + 1], samples.results[i + 1]],
    ];
    const [m, b] = line(p, q);
    return (m * n + b);
  }
};
