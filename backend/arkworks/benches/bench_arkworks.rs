#[macro_use]
extern crate criterion;

use ark_ec::pairing::Pairing;
use ark_ec::CurveGroup;
use ark_ec::VariableBaseMSM;
use ark_ff::Field;
use ark_std::test_rng;
use ark_std::UniformRand;
use criterion::{black_box, BenchmarkId, Criterion};
use std::ops::Add;

use ark_test_curves::bls12_381::Bls12_381;

fn bench_add_ff<P: Pairing>(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("add_ff", |b| {
        let lhs = P::ScalarField::rand(&mut rng);
        let rhs = P::ScalarField::rand(&mut rng);
        b.iter(|| black_box(lhs) + black_box(rhs))
    });
}

fn bench_mul_ec<P: Pairing>(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("mul_ec", |b| {
        let lhs = P::G1::rand(&mut rng);
        let rhs = P::ScalarField::rand(&mut rng);
        b.iter(|| black_box(lhs) * black_box(rhs))
    });
}

fn bench_mul_ff<P: Pairing>(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("mul_ff", |b| {
        let lhs = P::ScalarField::rand(&mut rng);
        let rhs = P::ScalarField::rand(&mut rng);
        b.iter(|| black_box(lhs) * black_box(rhs))
    });
}

fn bench_add_ec<P: Pairing>(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("add_ec", |r| {
        let a = P::G1::rand(&mut rng);
        let b = P::G1::rand(&mut rng);
        r.iter(|| a.add(b))
    });
}

fn bench_msm<P: Pairing>(c: &mut Criterion) {
    let rng = &mut test_rng();

    let mut group = c.benchmark_group("msm");
    for d in 1..=21 {
        let size = 1 << d;

        // Dynamically control sample size so that big MSMs don't bench eternally
        if size > 2_u32.pow(20).try_into().unwrap() {
            group.sample_size(10);
        }

        let scalars = (0..size)
            .map(|_| P::ScalarField::rand(rng))
            .collect::<Vec<_>>();
        let g1s = (0..size)
            .map(|_| P::G1::rand(rng).into_affine())
            .collect::<Vec<_>>();
        let g2s = (0..size)
            .map(|_| P::G2::rand(rng).into_affine())
            .collect::<Vec<_>>();

        group.bench_with_input(BenchmarkId::new("G1", size), &d, |b, _| {
            b.iter(|| P::G1::msm(&g1s, &scalars))
        });
        group.bench_with_input(BenchmarkId::new("G2", size), &d, |b, _| {
            b.iter(|| P::G2::msm(&g2s, &scalars))
        });
    }
}

fn bench_sum_of_products<P: Pairing>(c: &mut Criterion) {
    let rng = &mut test_rng();
    c.bench_function("ip", |b| {
        const SIZE: usize = 256;
        let lhs: [P::ScalarField; SIZE] = (0..SIZE)
            .map(|_| P::ScalarField::rand(rng))
            .collect::<Vec<_>>()
            .try_into()
            .unwrap();
        let rhs: [P::ScalarField; SIZE] = (0..SIZE)
            .map(|_| P::ScalarField::rand(rng))
            .collect::<Vec<_>>()
            .try_into()
            .unwrap();
        b.iter(|| P::ScalarField::sum_of_products(&lhs, &rhs))
    });
}

fn bench_invert<P: Pairing>(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("invert", |b| {
        let a = P::ScalarField::rand(&mut rng);
        b.iter(|| a.inverse().unwrap())
    });
}

fn bench_pairing<P: Pairing>(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("pairing", |r| {
        let a = P::G1::rand(&mut rng).into_affine();
        let b = P::G2::rand(&mut rng).into_affine();
        r.iter(|| P::pairing(a, b))
    });
}

fn bench_pairing_product<P: Pairing>(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    let mut group = c.benchmark_group("pairing_product");
    for d in 4..=10 {
        let size = 1 << d;
        let g1s = (0..size)
            .map(|_| P::G1::rand(&mut rng).into_affine())
            .collect::<Vec<_>>();
        let g2s = (0..size)
            .map(|_| P::G2::rand(&mut rng).into_affine())
            .collect::<Vec<_>>();

        group.bench_with_input(BenchmarkId::from_parameter(size), &d, |b, _| {
            b.iter(|| P::multi_pairing(&g1s, &g2s))
        });
    }
}

criterion_group! {
    name=arkworks_benchmarks;
    config=Criterion::default();
    targets=
        bench_mul_ff::<Bls12_381>,
        bench_mul_ec::<Bls12_381>,
        bench_add_ff::<Bls12_381>,
        bench_add_ec::<Bls12_381>,
        bench_sum_of_products::<Bls12_381>,
        bench_msm::<Bls12_381>,
        bench_invert::<Bls12_381>,
        bench_pairing::<Bls12_381>,
        bench_pairing_product::<Bls12_381>
}

criterion_main! {arkworks_benchmarks}
