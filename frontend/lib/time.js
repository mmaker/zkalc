export const humanTime = (nanoseconds) => {
  const units = ["ns", "μs", "ms", "s", "min", "hr", "day"];
  const conversions = [1, 1000, 1000, 1000, 60, 60, 24];

  let value = Number(nanoseconds);
  let unitIndex = 0;
  let remainder = 0;
  while (value >= conversions[unitIndex] && unitIndex < conversions.length) {
    remainder = value % conversions[unitIndex];
    value = Math.floor(value / conversions[unitIndex]);
    unitIndex += 1;
  }

  if (remainder !== 0) {
    return `${value.toFixed(1)} ${units[unitIndex - 1]} ${remainder.toFixed(
      2
    )} ${units[unitIndex - 2]}`;
  } else {
    return `${value.toFixed(1)} ${units[unitIndex]}`;
  }
};

export const siTime = (num) => {
  if (num !== 0) {
    const exponent = Math.floor(Math.log10(num));
    const float = num / Math.pow(10, exponent);
    const decimals = Number(float.toFixed(3));

    // time is expressed in nanoseconds, change this to seconds
    return `${decimals}e${exponent - 9} s`;
  } else {
    return "0s";
  }
};
