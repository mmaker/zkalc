#[macro_use]
extern crate criterion;

use ark_ec::pairing::Pairing;
use ark_ec::{CurveGroup, ScalarMul};
use ark_ff::{FftField, Field};
use ark_poly::univariate::DensePolynomial;
use ark_poly::{DenseUVPolynomial, EvaluationDomain, GeneralEvaluationDomain};
use ark_std::test_rng;
use ark_std::UniformRand;
use criterion::measurement::Measurement;
use criterion::BenchmarkGroup;
use criterion::{BenchmarkId, Criterion};
use rand::RngCore;

fn bench_msm<G: CurveGroup, M: Measurement>(c: &mut BenchmarkGroup<'_, M>, group_name: &str) {
    let rng = &mut test_rng();

    for logsize in (10..=21).chain(24..25) {
        // Dynamically control sample size so that big MSMs don't bench eternally
        c.sample_size(10);
        let size = (1 << logsize) + (rng.next_u64() % (1 << logsize)) as usize;

        let scalars = (0..size)
            .map(|_| G::ScalarField::rand(rng))
            .collect::<Vec<_>>();
        let gs = (0..size)
            .map(|_| G::rand(rng).into_affine())
            .collect::<Vec<_>>();
        c.bench_with_input(
            BenchmarkId::new(format!("msm_{}", group_name), size),
            &logsize,
            |b, _| b.iter(|| G::msm(&gs, &scalars)),
        );
    }
}

fn bench_multi_pairing<P: Pairing, M: Measurement>(c: &mut BenchmarkGroup<'_, M>) {
    let rng = &mut test_rng();
    for logsize in (7..=12).chain(11..13) {
        let size = (1 << logsize) + (rng.next_u64() % (1 << logsize)) as usize;
        let g1s = (0..size)
            .map(|_| P::G1::rand(rng).into_affine())
            .collect::<Vec<_>>();
        let g2s = (0..size)
            .map(|_| P::G2::rand(rng).into_affine())
            .collect::<Vec<_>>();
        c.bench_with_input(BenchmarkId::new("msm_Gt", size), &logsize, |b, _| {
            b.iter(|| P::multi_pairing(&g1s, &g2s))
        });
    }
}


fn bench_mul<G: ScalarMul, M: Measurement>(c: &mut BenchmarkGroup<'_, M>, group_name: &str) {
    let rng = &mut test_rng();
    c.bench_function(format!("mul_{}", group_name), |b| {
        const SIZE: usize = 256;
        let lhs = G::rand(rng);
        let rhs = G::ScalarField::rand(rng);
        b.iter(|| lhs * &rhs)
    });
}

fn bench_pairing<P: Pairing, M: Measurement>(c: &mut BenchmarkGroup<'_, M>) {
    let mut rng = rand::thread_rng();
    c.bench_function("pairing", |r| {
        let a = P::G1::rand(&mut rng).into_affine();
        let b = P::G2::rand(&mut rng).into_affine();
        r.iter(|| P::pairing(a, b))
    });
}

fn bench_fft<F: FftField, M: Measurement>(c: &mut BenchmarkGroup<'_, M>) {
    let mut rng = rand::thread_rng();
    for logsize in (15..=21).chain(22..23) {
        let degree = (1 << logsize) + (rng.next_u64() % (1 << logsize)) as usize;
        c.sample_size(10);
        match GeneralEvaluationDomain::<F>::new(degree) {
            Some(domain) =>  {
                c.bench_with_input(BenchmarkId::new("fft", degree), &logsize, |b, _| {
                    let a = DensePolynomial::<F>::rand(degree, &mut rng)
                        .coeffs()
                        .to_vec();
                    b.iter(|| domain.fft(&a))
                });
            },
            None => continue,
        }
    }
}

macro_rules ! bench_pairing {
    ($name: ident, $lib: path, $pairing: ident, $id: expr) => {
        fn $name(c: &mut Criterion) {
            use $lib::{$pairing, Fr, G1Projective as G1, G2Projective as G2};
            type Gt = ark_ec::pairing::PairingOutput<$pairing>;

            let mut group = c.benchmark_group($id);
            bench_msm::<G1, _>(&mut group, "G1");
            bench_msm::<G2, _>(&mut group, "G2");
            // bench_mul::<Gt, _>(&mut group, "Gt");
            bench_multi_pairing::<$pairing, _>(&mut group);
            // bench_pairing::<$pairing, _>(&mut group);
            // bench_sum_of_products::<Fr, _>(&mut group);
            bench_fft::<Fr, _>(&mut group);
            group.finish();
        }
    };
}

bench_pairing!(bench_bn254, ark_bn254, Bn254, "bn254");
bench_pairing!(bench_bls12_381, ark_bls12_381, Bls12_381, "bls12_381");
bench_pairing!(bench_bls12_377, ark_bls12_377, Bls12_377, "bls12_377");
bench_pairing!(bench_mnt4_298, ark_mnt4_298, MNT4_298, "mnt4_298");
bench_pairing!(bench_mnt6_298, ark_mnt6_298, MNT6_298, "mnt6_298");



fn bench_curve25519(c: &mut Criterion) {
    use ark_curve25519::{EdwardsProjective as G, Fr};
    let mut group = c.benchmark_group("curve25519");
    bench_msm::<G, _>(&mut group, "G1");
    // bench_sum_of_products::<Fr, _>(&mut group);
    bench_fft::<Fr, _>(&mut group);
    group.finish();
}

fn bench_secp256k1(c: &mut Criterion) {
    use ark_secp256k1::{Fr, Projective as G};
    let mut group = c.benchmark_group("secp256k1");
    bench_msm::<G, _>(&mut group, "G1");
    // bench_sum_of_products::<Fr, _>(&mut group);
    bench_fft::<Fr, _>(&mut group);
    group.finish();
}

fn bench_pallas(c: &mut Criterion) {
    use ark_pallas::{Fr, Projective as G};
    let mut group = c.benchmark_group("pallas");
    bench_msm::<G, _>(&mut group, "G1");
    // bench_sum_of_products::<Fr, _>(&mut group);
    bench_fft::<Fr, _>(&mut group);
    group.finish();
}

fn bench_vesta(c: &mut Criterion) {
    use ark_pallas::{Fr, Projective as G};
    let mut group = c.benchmark_group("vesta");
    bench_msm::<G, _>(&mut group, "G1");
    // bench_sum_of_products::<Fr, _>(&mut group);
    bench_fft::<Fr, _>(&mut group);
    group.finish();
}

criterion_group!(
    benches,
    bench_vesta,
    bench_pallas,
    bench_secp256k1,
    bench_curve25519,
    bench_bls12_377,
    bench_bls12_381,
    bench_bn254,
    bench_mnt4_298,
    bench_mnt6_298
);
criterion_main!(benches);
