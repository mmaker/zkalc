const estimate_kzg = {
  setup: (est, n) => {
    est["mul_G1"](n);
  },
  commit: (est, n) => {
    est["msm_G1"](n);
  },
  open: (est, n) => {
    est["msm_G1"](n - 1);
  },
  verify: (est, n) => {
    est["pairing"](2);
  },
};

const estimate_gnark_plonk = {
  prove: (est, r1cs) =>
    est("msm_G1")(r1cs["mul"]) +
    est("fft_ff")(r1cs["add"]) +
    // skipping batch inversion for now
    // commitment to z
    3 * est("msm_G1")(r1cs["instance_size"] + r1cs["witness_size"]) +
    // commitment to (h): za zb zc
    3 * est("msm_G1")(r1cs["add"]) +
    // commitment to the linearized polynomial
    est("msm_G1")(r1cs["mul"]) +
    // batch opening (skipping field operations for now)
    est("msm_G1")(Math.max(r1cs["mul"], r1cs["add"])),
};

const estimate_groth16 = {
  prove: (est, r1cs) =>
    // for an implementation of Groth16, we have:
    // - arkworks's which leads to function create_proof_with_assignment
    //    https://github.com/arkworks-rs/groth16/blob/HEAD/src/prover.rs#L54
    // - gnark's which leads to function create_proof_with_assignment
    //    https://github.com/Consensys/gnark/blob/v0.8.1/internal/backend/bls12-381/groth16/prove.go#L116
    est("msm_G1")(r1cs["mult"]) +
    4 * est("fft_ff")(r1cs["add"]) +
    1 * est("mul_ff")(r1cs["add"]) +
    2 * est("msm_G1")(r1cs["instance_size"] + r1cs["witness_size"]) +
    2 * est("msm_G2")(r1cs["instance_size"] + r1cs["witness_size"]) +
    4 * est("mul_G1")(4) +
    2 * est("mul_G2")(4),
};

export const zkp_est = {
  kzg: estimate_kzg,
  groth16: estimate_groth16,
  gnark_plonk: estimate_gnark_plonk,
};
