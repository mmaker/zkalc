const estimate_kzg = {
  setup: (est, n) => est("mul_G1")(n),
  commit: (est, n) => est("msm_G1")(n),
  open: (est, n) => est("mul_ff")(n) + est("add_ff")(n) + est("msm_G1")(n - 1),
  verify: (est, n) => est("add_G1")(1) + est("mul_G1")(1) + est("pairing")(2),
};

const estimate_bulletproof = {
  verify: (est, _n) => {
    const n = Math.ceil(Math.log2(_n));
    return (
      // fold the generators
      est("mul_G1")(2 * n) +
      est("add_G1")(n) +
      // fold the statement
      est("mul_G1")(n) +
      est("add_G1")(n) +
      // comparison in the last round
      est("add_G1")(4) +
      est("mul_G1")(3)
    );
  },
  prove: (est, _n) => {
    const n = Math.ceil(Math.log2(_n));
    return (
      // fold the witness vectors
      est("mul_ff")(n / 2) +
      est("add_ff")(n / 2) +
      // commit to the folded witness (the cross terms + new IP
      est("mul_G1")(n / 2) +
      est("msm_G1")(n) +
      // challenge computation
      est("invert")(n / 2) +
      // fold the generators
      est("mul_G1")(n) +
      est("add_G1")(n) +
      est("mul_G1")(2 * n) +
      est("add_G1")(2 * n) +
      // squares
      est("mul_ff")(1)
    );
  },
};

const estimate_gnark_plonk = {
  verify: (est, r1cs) =>
    // implemented in:
    // https://github.com/Consensys/gnark/blob/master/internal/backend/bls12-381/plonk/verify.go
    //
    // field division on the instance size
    // https://github.com/Consensys/gnark/blob/master/internal/backend/bls12-381/plonk/verify.go#L106
    est("invert")(r1cs["instance_size"]) +
    // folded commit
    // https://github.com/Consensys/gnark/blob/master/internal/backend/bls12-381/plonk/verify.go#L149
    est("mul_G2")(2) + est("add_G2")(2) +
    // folding of the proof for batching
    // https://github.com/Consensys/gnark/blob/master/internal/backend/bls12-381/plonk/verify.go#L203
    est("msm")(7) +
    /// kzg verification
    est("pairing")(2),

  prove: (est, r1cs) =>
    // We have three advice columns so:

    // Commit to column polynomials: commitToLRO()
    3 * est("msm_G1")(r1cs["constraints"]) +

    // Work on permutation argument:
    // IFFT in BuildRatioCopyConstraint
    1 * est("fft_ff")(r1cs["constraints"]) +
    // 1 msm commit to z: permutation poly
    1 * est("msm_G1")(r1cs["constraints"]) +


    // IFFT for qkCompletedCanonical
    1 * est("fft_ff")(r1cs["constraints"]) +


    // Convert column polys to expanded eval form: bwliop.ToLagrangeCoset() and below
    3 * est("fft_ff")(2* r1cs["constraints"]) +
    // Convert column polys to coeff form: widiop, bwsziop, wloneiop
    3 * est("fft_ff")(r1cs["constraints"]) +

    // Convert quotient poly to coeff form
    1 * est("fft_ff")(r1cs["constraints"]) +
    // 3 MSMs in commitToQuotient(): h1, h2, h3
    3 * est("msm_G1")(r1cs["constraints"]) +

    // 1 MSM in kzg.open for ZShiftedOpening
    1 * est("msm_G1")(r1cs["constraints"]) +
    // 1 msm to commit to linearized poly
    1 * est("msm_G1")(r1cs["constraints"]) +

    // Create evaluation proof: 1 msm in BatchOpenSinglePoint
    1 * est("msm_G1")(r1cs["constraints"])
};

const estimate_groth16 = {
  verify: (est, r1cs) =>
    // in arkworks, the verifier does not need to prepare inputs every time
    // In gnark, this part is also computed
    // function prepare_inputs
    // est("msm_G1")(r1cs["instance_size"]) +
    // function verify_proof_with_prepared_inputs
    est("pairing")(3),

  prove: (est, r1cs) =>
    // for an implementation of Groth16, we have:
    // - arkworks's which leads to function create_proof_with_assignment
    //    https://github.com/arkworks-rs/groth16/blob/HEAD/src/prover.rs#L54
    // - gnark's which leads to function create_proof_with_assignment
    //    https://github.com/Consensys/gnark/blob/v0.8.1/internal/backend/bls12-381/groth16/prove.go#L116
    est("msm_G1")(r1cs["constraints"]) +
    1 * est("fft_ff")(r1cs["instance_size"] + r1cs["witness_size"]) +
    // negl. check how many there are
    // 1 * est("mul_ff")(r1cs["instance_size"] + r1cs["witness_size"]) +
    2 * est("msm_G1")(r1cs["instance_size"] + r1cs["witness_size"]) +
    1 * est("msm_G2")(r1cs["instance_size"] + r1cs["witness_size"]) +
    4 * est("mul_G1")(4) +
    est("mul_G2")(4),
};

export const cookbook = {
  kzg: estimate_kzg,
  groth16: estimate_groth16,
  bulletproof: estimate_bulletproof,
  gnark_plonk: estimate_gnark_plonk,
};
