/// how many elements to keep for regression.
const regressionSet = 4;

export const estimates = require("../data/estimates.json");

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

const nOverLognEstimation = (samples) => {
  return (n) => {
    let { range, results } = samples;
    if (n > range[range.length - 1]) { // extrapolate to the right (do regression)
      const xs =
        n < range[0]
          ? range.slice(0, regressionSet)
          : range.slice(-regressionSet);
      const ys = (
        n < range[0]
          ? results.slice(0, regressionSet)
          : results.slice(-regressionSet)
      ).map((x) => x * Math.log2(n));
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

const nLognEstimation = (samples) => {
  return (n) => {
    let { range, results } = samples;
    if (n > range[range.length - 1]) { // extrapolate to the right (do regression)
      const xs =
        n < range[0]
          ? range.slice(0, regressionSet)
          : range.slice(-regressionSet);
      const ys = (
        n < range[0]
          ? results.slice(0, regressionSet)
          : results.slice(-regressionSet)
      ).map((x) => x / Math.log2(n));
      const extrapolate = linearRegression(xs, ys);
      return extrapolate(n) * Math.log2(n);
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
  msm_G1: nOverLognEstimation,
  msm_G2: nOverLognEstimation,
  msm_Gt: linearEstimation,
  fft: nLognEstimation,
};

export const getEstimates = (curve, lib, machine) => {
  if (!(curve in estimates)) {
    throw new Error(`Curve ${curve} not found`);
  } else if (!(lib in estimates[curve])) {
    throw new Error(`Library ${lib} not found`);
  } else if (!(machine in estimates[curve][lib])) {
    throw new Error(`Machine ${machine} not found`);
  } else {
    return require('../data/' + estimates[curve][lib][machine])
  }
};

export const estimator = (curve, lib, machine, op) => {
  let est = getEstimates(curve, lib, machine);
  if (op in est) {
    let samples = est[op];
    let f = estimating_functions[op] || estimating_functions["default"];
    return f(samples);
  } else {
    return (_n) => null;
  }
};
