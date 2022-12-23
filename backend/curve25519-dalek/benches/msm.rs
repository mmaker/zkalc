#[macro_use]
extern crate criterion;

use criterion::{BenchmarkId, Criterion};
use rand::rngs::OsRng;
use curve25519_dalek::ristretto::RistrettoPoint;
use curve25519_dalek::scalar::Scalar;
use curve25519_dalek::traits::MultiscalarMul;

fn bench_msm(c: &mut Criterion) {
    for d in 12..17 {
        let mut group = c.benchmark_group("curve25519-dalek");

        group.bench_with_input(BenchmarkId::new("msm", d), &d, |b, &d| {
            let size = 1 << d;
            let scalars = (0..size)
                .map(|_| Scalar::random(&mut OsRng))
                .collect::<Vec<_>>();
            let bases = (0..size)
                .map(|_| RistrettoPoint::random(&mut OsRng))
                .collect::<Vec<_>>();
            b.iter(|| RistrettoPoint::multiscalar_mul(scalars.iter(), bases.iter()))
        });
    }
}

criterion_group! {
    name=msm_benchmarks;
    config=Criterion::default();
    targets=bench_msm,
}

criterion_main! {msm_benchmarks}
