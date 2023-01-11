
  // find the line passing through points p and q
  const line = ([x1, y1], [x2, y2]) => {
    const m = (y2 - y1) / (x2 - x1);
    const b = y1 - m * x1;
    return [m, b];
  };

  const interval = (samples, x) => {
    var i = 2;
    let range = samples.range;
    while (i < range.length && range[i] <= x) { i++; }
    const larger = i-1;
    const smaller = larger-1;
    return [
      [samples.range[smaller], samples.results[smaller]],
      [samples.range[larger], samples.results[larger]],
    ];
  };

  const linearEstimator = (samples, n) => {
    const [p, q] = interval(samples, n);
    const [m, b] = line(p, q);
    return m * n + b;
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
    if (samples.range.length === 1) {
        return n * samples.results[0];
    } else {
    let xs = samples.range;
    let ys = samples.range.map((x, i) => samples.results[i] * Math.log2(x));
    return linearRegression(xs, ys)(n);
    }
  };