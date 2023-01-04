#[macro_use]
extern crate criterion;

use ark_ec::CurveGroup;
use ark_ff::Field;
use ark_ec::VariableBaseMSM;
use ark_ec::pairing::Pairing;
use ark_std::test_rng;
use ark_std::UniformRand;
use criterion::{BenchmarkId, Criterion, black_box};
use std::ops::Add;

use ark_test_curves::bls12_381;

fn bench_add_ff(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("add_ff", |b| {
        let lhs = bls12_381::Fr::rand(&mut rng);
        let rhs = bls12_381::Fr::rand(&mut rng);
        b.iter(|| black_box(lhs) + black_box(rhs))
    });
}

fn bench_mul(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("mul", |b| {
        let lhs = bls12_381::Fr::rand(&mut rng);
        let rhs = bls12_381::Fr::rand(&mut rng);
        b.iter(|| black_box(lhs) * black_box(rhs))
    });
}


fn bench_add_ec(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("add_ec", |r| {
        let a = bls12_381::G1Projective::rand(&mut rng);
        let b = bls12_381::G1Projective::rand(&mut rng);
        r.iter(|| a.add(b))
    });
}

fn bench_msm(c: &mut Criterion) {
    let rng = &mut test_rng();

    let mut group = c.benchmark_group("msm");
    for d in 0..22 {
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

        group.bench_with_input(BenchmarkId::new("G1", size), &d, |b, _| {
                b.iter(|| bls12_381::G1Projective::msm(&g1s, &scalars))
            });
        group.bench_with_input(BenchmarkId::new("G2", size), &d, |b, _| {
                b.iter(|| bls12_381::G2Projective::msm(&g2s, &scalars))
            });
    }
}


fn bench_sum_of_products(c: &mut Criterion) {
    let rng = &mut test_rng();
    c.bench_function("ip", |b| {
        const SIZE: usize = 256;
        let lhs: [bls12_381::Fr; SIZE] = (0..SIZE).map(|_| bls12_381::Fr::rand(rng)).collect::<Vec<_>>().try_into().unwrap();
        let rhs: [bls12_381::Fr; SIZE] = (0..SIZE).map(|_| bls12_381::Fr::rand(rng)).collect::<Vec<_>>().try_into().unwrap();
        b.iter(|| bls12_381::Fr::sum_of_products(&lhs, &rhs))
    });
}

fn bench_invert(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("invert", |b| {
        let a = bls12_381::Fr::rand(&mut rng);
        b.iter(|| a.inverse().unwrap())
    });
}

fn bench_pairing(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("pairing", |r| {
        let a = bls12_381::G1Projective::rand(&mut rng).into_affine();
        let b = bls12_381::G2Projective::rand(&mut rng).into_affine();
        r.iter(|| bls12_381::Bls12_381::pairing(a, b))
    });
}

fn bench_pairing_product(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    let mut group = c.benchmark_group("pairing_product");
    for d in 4..=10 {
        let size = 1 << d;
        let g1s = (0..size)
            .map(|_| bls12_381::G1Projective::rand(&mut rng).into_affine())
            .collect::<Vec<_>>();
        let g2s = (0..size)
            .map(|_| bls12_381::G2Projective::rand(&mut rng).into_affine())
            .collect::<Vec<_>>();

        group.bench_with_input(BenchmarkId::from_parameter(size), &d, |b, _| {
            b.iter(|| bls12_381::Bls12_381::multi_pairing(&g1s, &g2s))
        });
    }
}

criterion_group! {
    name=arkworks_benchmarks;
    config=Criterion::default();
    targets = bench_mul, bench_add_ff, bench_add_ec, bench_sum_of_products, bench_msm, bench_invert, bench_pairing, bench_pairing_product
}

criterion_main! {arkworks_benchmarks}
