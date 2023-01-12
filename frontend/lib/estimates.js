
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
    } else if (range[0] > n || range[range.length-1] < n) {
      const xs = range;
      const ys = range.map((x, i) => samples.results[i] * Math.log2(x));
      const extrapolate = linearRegression(xs, ys)
      return extrapolate(n)
    } else {
      let i = 0;
      while (range[i] <= x && i < range.length-1) {i++; }
      let interval = interval(range, n);
      let [p, q] = [
        [samples.range[i], samples.results[i+1]],
        [samples.range[i], samples.results[i+1]],
      ];
      const [m, b] = line(p, q);
      return m * n + b;
    }
  };