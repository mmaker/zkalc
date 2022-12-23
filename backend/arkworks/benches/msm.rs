#[macro_use]
extern crate criterion;

use ark_ec::CurveGroup;
use ark_ec::VariableBaseMSM;
use ark_std::test_rng;
use ark_std::UniformRand;
use criterion::{BenchmarkId, Criterion};

use ark_test_curves::bls12_381;

fn bench_msm(c: &mut Criterion) {
    let rng = &mut test_rng();

    let mut group = c.benchmark_group("msm");
    for d in 4..5 {
        let size = 1 << d;
        let scalars = (0..size)
            .map(|_| bls12_381::Fr::rand(rng))
            .collect::<Vec<_>>();
        let g1s = (0..size)
            .map(|_| bls12_381::G1Projective::rand(rng).into_affine())
            .collect::<Vec<_>>();
        let g2s = (0..size)
            .map(|_| bls12_381::G2Projective::rand(rng).into_affine())
            .collect::<Vec<_>>();

        group.bench_with_input(BenchmarkId::new("G1", d), &d, |b, _| {
                b.iter(|| bls12_381::G1Projective::msm(&g1s, &scalars))
            });
        group.bench_with_input(BenchmarkId::new("G2", d), &d, |b, _| {
                b.iter(|| bls12_381::G2Projective::msm(&g2s, &scalars))
            });
    }
}

criterion_group! {
    name=msm_benchmarks;
    config=Criterion::default();
    targets=bench_msm,
}

criterion_main! {msm_benchmarks}
