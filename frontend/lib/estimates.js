import estBls12381ArkAwsC59xlarge from "../data/bls12-381/arkworks/aws_c5.9xlarge.json";
import estBls12381BlstAwsC59xlarge from "../data/bls12-381/blstrs/aws_c5.9xlarge.json";
import estCurve25519DalekAwsC59xlarge from "../data/curve25519/curve25519-dalek/aws_c5.9xlarge.json";
import estBls12381ArkAwsM52xlarge from "../data/bls12-381/arkworks/aws_m5.2xlarge.json";
import estBls12381BlstAwsM52xlarge from "../data/bls12-381/blstrs/aws_m5.2xlarge.json";
import estCurve25519DalekAwsM52xlarge from "../data/curve25519/curve25519-dalek/aws_m5.2xlarge.json";
import estBls12381ZkCryptoAwsC59xlarge from "../data/bls12-381/zkcrypto/aws_c5.9xlarge.json";
import estBls12381ZkCryptoAwsM52xlarge from "../data/bls12-381/zkcrypto/aws_m5.2xlarge.json";
import estBls12377ArkAwsC59xlarge from "../data/bls12-377/arkworks/aws_c5.9xlarge.json";
import estBls12377ArkAwsM52xlarge from "../data/bls12-377/arkworks/aws_m5.2xlarge.json";
import estSecp256k1ArkAwsC59xlarge from "../data/secp256k1/arkworks/aws_c5.9xlarge.json";
import estSecp256k1ArkAwsM52xlarge from "../data/secp256k1/arkworks/aws_m5.2xlarge.json";
import estPallasArkAwsC59xlarge from "../data/pallas/arkworks/aws_c5.9xlarge.json";
import estPallasArkAwsM52xlarge from "../data/pallas/arkworks/aws_m5.2xlarge.json";
import estVestaArkAwsC59xlarge from "../data/vesta/arkworks/aws_c5.9xlarge.json";
import estVestaArkAwsM52xlarge from "../data/vesta/arkworks/aws_m5.2xlarge.json";
import estCurve25519ArkAwsC59xlarge from "../data/curve25519/arkworks/aws_c5.9xlarge.json";
import estCurve25519ArkAwsM52xlarge from "../data/curve25519/arkworks/aws_m5.2xlarge.json";
import estBls12381GnarkAwsC59xlarge from "../data/bls12-381/gnark/aws_c5.9xlarge.json";
import estBls12377GnarkAwsC59xlarge from "../data/bls12-377/gnark/aws_c5.9xlarge.json";
import estSecp256k1GnarkAwsC59xlarge from "../data/secp256k1/gnark/aws_c5.9xlarge.json";
import estBn254GnarkAwsC59xlarge from "../data/bn254/gnark/aws_c5.9xlarge.json";
import estVestaZcashAwsC59xlarge from "../data/vesta/zcash/aws_c5.9xlarge.json";
import estPallasZcashAwsC59xlarge from "../data/pallas/zcash/aws_c5.9xlarge.json";
import estVestaZcashAwsM52xlarge from "../data/vesta/zcash/aws_m5.2xlarge.json";
import estPallasZcashAwsM52xlarge from "../data/pallas/zcash/aws_m5.2xlarge.json";

import estBls12381ArkAwsA12xlarge from "../data/bls12-381/arkworks/aws_a1.2xlarge.json";
import estBls12381BlstAwsA12xlarge from "../data/bls12-381/blstrs/aws_a1.2xlarge.json";
import estBls12381ZkCryptoAwsA12xlarge from "../data/bls12-381/zkcrypto/aws_a1.2xlarge.json";
import estCurve25519DalekAwsA12xlarge from "../data/curve25519/curve25519-dalek/aws_a1.2xlarge.json";
import estPallasZcashAwsA12xlarge from "../data/pallas/zcash/aws_a1.2xlarge.json";
import estVestaZcashAwsA12xlarge from "../data/vesta/zcash/aws_a1.2xlarge.json";

/// how many elements to keep for regression.
const regressionSet = 4;

export const estimates = {
  "curve25519": {
    "arkworks": {
      "aws_c5.9xlarge": estCurve25519ArkAwsC59xlarge,
      "aws_m5.2xlarge": estCurve25519ArkAwsM52xlarge,
    },
    "curve25519_dalek": {
      "aws_a1.2xlarge": estCurve25519DalekAwsA12xlarge,
      "aws_c5.9xlarge": estCurve25519DalekAwsC59xlarge,
      "aws_m5.2xlarge": estCurve25519DalekAwsM52xlarge,
      // "m1pro": estCurve25519DalekM1,
      // "thinkpad_t450": estCurve25519DalekT450,
    },
  },
  "bls12_381": {
    "blstrs": {
      // "thinkpad_t450": estBls12381BlstT450,
      // "m1pro": estBls12381BlstM1,
      "aws_a1.2xlarge": estBls12381BlstAwsA12xlarge,
      "aws_m5.2xlarge": estBls12381BlstAwsM52xlarge,
      "aws_c5.9xlarge": estBls12381BlstAwsC59xlarge,
    },
    "arkworks": {
      // "thinkpad_t450": estBls12381ArkT450,
      // "m1pro": estBls12381ArkM1,
      "aws_a1.2xlarge": estBls12381ArkAwsA12xlarge,
      "aws_m5.2xlarge": estBls12381ArkAwsM52xlarge,
      "aws_c5.9xlarge": estBls12381ArkAwsC59xlarge,
    },
    "zkcrypto": {
      "aws_a1.2xlarge": estBls12381ZkCryptoAwsA12xlarge,
      "aws_c5.9xlarge": estBls12381ZkCryptoAwsC59xlarge,
      "aws_m5.2xlarge": estBls12381ZkCryptoAwsM52xlarge,
    },
    "gnark": {
      "aws_c5.9xlarge": estBls12381GnarkAwsC59xlarge,
    }
  },
  "bls12_377": {
    "arkworks": {
      "aws_c5.9xlarge": estBls12377ArkAwsC59xlarge,
      "aws_m5.2xlarge": estBls12377ArkAwsM52xlarge,
      // thinkpad_t450: estBls12377ArkT450,
      // "m1pro": estBls12377ArkM1,
    },
    "gnark": {
      "aws_c5.9xlarge": estBls12377GnarkAwsC59xlarge,
    }
  },
  "secp256k1": {
    "arkworks": {
      "aws_c5.9xlarge": estSecp256k1ArkAwsC59xlarge,
      "aws_m5.2xlarge": estSecp256k1ArkAwsM52xlarge,
    },
    "gnark": {
      "aws_c5.9xlarge": estSecp256k1GnarkAwsC59xlarge,
    }
  },
  "pallas": {
    "arkworks": {
      "aws_c5.9xlarge": estPallasArkAwsC59xlarge,
      "aws_m5.2xlarge": estPallasArkAwsM52xlarge,
    },
    "zcash": {
      "aws_a1.2xlarge": estPallasZcashAwsA12xlarge,
      "aws_c5.9xlarge": estPallasZcashAwsC59xlarge,
      "aws_m5.2xlarge": estPallasZcashAwsM52xlarge,
    }
  },
  "vesta": {
    "arkworks": {
      "aws_c5.9xlarge": estVestaArkAwsC59xlarge,
      "aws_m5.2xlarge": estVestaArkAwsM52xlarge,
    },
    "zcash": {
      "aws_a1.2xlarge": estVestaZcashAwsA12xlarge,
      "aws_c5.9xlarge": estVestaZcashAwsC59xlarge,
      "aws_m5.2xlarge": estVestaZcashAwsM52xlarge,
    }
  },
  "bn254": {
    "gnark": {
      "aws_c5.9xlarge": estBn254GnarkAwsC59xlarge,
    }
  },
  "bn254": {
    "gnark": {
      "aws_c5.9xlarge": estBn254GnarkAwsC59xlarge,
    }
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
  msm_Gt: linearEstimation,
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
