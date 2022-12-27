#![allow(non_snake_case)]

use blstrs::{G1Projective, G2Projective, Scalar};
use criterion::*;
use group::ff::Field;
use group::{Group, Curve};
use pairing_lib::{PairingCurveAffine};

fn bench_add(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("add", |b| {
        let lhs = Scalar::random(&mut rng);
        let rhs = Scalar::random(&mut rng);
        b.iter(|| black_box(lhs) + black_box(rhs))
    });
}

fn bench_mul(c: &mut Criterion) {
    let mut rng = rand::thread_rng();
    c.bench_function("mul", |b| {
        let lhs = Scalar::random(&mut rng);
        let rhs = Scalar::random(&mut rng);
        b.iter(|| black_box(lhs) * black_box(rhs))
    });
}

fn bench_msm(c: &mut Criterion) {
    let mut rng = rand::thread_rng();

    let mut powers_of_two = Vec::<usize>::new();
    for i in 4..22 {
        powers_of_two.push(2_u32.pow(i).try_into().unwrap());
    }

    let mut group = c.benchmark_group("msm");
    for size in powers_of_two.into_iter() {
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

criterion_group! {name = blstrs_benchmarks;
                  config = Criterion::default().sample_size(10);
                  targets = bench_mul, bench_add, bench_msm, bench_invert, bench_pairing
}

criterion_main!(blstrs_benchmarks);
