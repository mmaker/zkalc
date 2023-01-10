export const formatNumber = (num) => {
  if (num >= 1e10) {
    const float = num / Math.pow(10, Math.floor(Math.log10(num)));
    const decimals = Number(float.toFixed(2));
    const exponent = Math.floor(Math.log10(num));
    return `${decimals} \\cdot 10^{${exponent}}`;
  } else if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)} \\cdot 10^9`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}\\cdot 10^6`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}\\cdot 10^3`;
  } else {
    return `${Number(num.toFixed(2))}`;
  }
};

export const formatFormula = (formula) => {
  const evaluation = formatNumber(formula.evaluate());
  // if the expression is simple, just return it.
  if (evaluation === formula.toTex()) {
    return formula.toTex();
    // else, round up to the closest integer
  } else {
    return formula.toTex() + "\\approx" + evaluation;
  }
};
