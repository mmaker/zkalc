#![allow(non_snake_case)]

use blstrs::{G1Projective, G2Projective, Scalar, G1Affine};
use criterion::*;
use group::ff::Field;
use group::{Group, Curve};
use pairing_lib::{PairingCurveAffine, MultiMillerLoop, MillerLoopResult};
use blstrs::{Bls12, G2Prepared};
use std::ops::Add;

fn bench_add_ff(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("add_ff", |b| {
        let lhs = Scalar::random(&mut rng);
        let rhs = Scalar::random(&mut rng);
        b.iter(|| black_box(lhs) + black_box(rhs))
    });
}

fn bench_mul_ff(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("mul_ff", |b| {
        let lhs = Scalar::random(&mut rng);
        let rhs = Scalar::random(&mut rng);
        b.iter(|| black_box(lhs) * black_box(rhs))
    });
}

fn bench_mul_ec(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("mul_ec", |b| {
        let lhs = G1Projective::random(&mut rng);
        let rhs = Scalar::random(&mut rng);
        b.iter(|| black_box(lhs) * black_box(rhs))
    });
}

fn bench_add_ec(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("add_ec", |r| {
        let a = G1Projective::random(&mut rng);
        let b = G1Projective::random(&mut rng);
        r.iter(|| a.add(b))
    });
}

fn bench_msm(c: &mut Criterion) {
    let mut rng = rand::thread_rng();

    let mut powers_of_two = Vec::<usize>::new();
    for i in 1..=21 {
        powers_of_two.push(2_u32.pow(i).try_into().unwrap());
    }

    let mut group = c.benchmark_group("msm");
    for size in powers_of_two.into_iter() {
        // Dynamically control sample size so that big MSMs don't bench eternally
        if size > 2_u32.pow(20).try_into().unwrap() {
            group.sample_size(10);
        }

        let vec_a: Vec<_> = (0..size).map(|_| Scalar::random(&mut rng)).collect();
        // G1 benchmarks
        let vec_B_G1: Vec<_> = (0..size).map(|_| G1Projective::random(&mut rng)).collect();
        group.bench_with_input(BenchmarkId::new("G1", size), &size, |b, _| {
            b.iter(|| G1Projective::multi_exp(&vec_B_G1, &vec_a));
        });

        // G2 benchmarks
        let vec_B_G2: Vec<_> = (0..size).map(|_| G2Projective::random(&mut rng)).collect();
        group.bench_with_input(BenchmarkId::new("G2", size), &size, |b, _| {
            b.iter(|| G2Projective::multi_exp(&vec_B_G2, &vec_a));
        });
    }

    group.finish()
}

fn bench_invert(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("invert", |b| {
        let a = Scalar::random(&mut rng);
        b.iter(|| a.invert().unwrap())
    });
}

fn bench_pairing(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("pairing", |r| {
        let a = G1Projective::random(&mut rng).to_affine();
        let b = G2Projective::random(&mut rng).to_affine();
        r.iter(|| a.pairing_with(&b))
    });
}

fn bench_pairing_product(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    let mut group = c.benchmark_group("pairing_product");
    for d in 4..=10 {
        let size = 1 << d;
        let mut v: Vec<(G1Affine, G2Prepared)> = Vec::new();
        for _ in 0..size {
            let g1 = G1Affine::from(G1Projective::random(&mut rng));
            let g2 = G2Prepared::from(G2Projective::random(&mut rng).to_affine());
            v.push((g1, g2));
        }

        let mut v_ref: Vec<(&G1Affine, &G2Prepared)> = Vec::new();
        for i in 0..size {
            v_ref.push((&v[i].0, &v[i].1));
        }

        group.bench_with_input(BenchmarkId::from_parameter(size), &d, |b, _| {
            b.iter(|| Bls12::multi_miller_loop(&v_ref).final_exponentiation())
        });
    }
}


criterion_group! {name = blstrs_benchmarks;
                  config = Criterion::default();
                  targets = bench_mul_ff, bench_mul_ec, bench_add_ff, bench_add_ec, bench_msm, bench_invert, bench_pairing, bench_pairing_product
}

criterion_main!(blstrs_benchmarks);
