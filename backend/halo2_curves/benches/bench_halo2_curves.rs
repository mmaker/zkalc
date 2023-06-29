use criterion::{black_box, criterion_group, criterion_main, Criterion};
use pasta_curves::group::Group;
use std::any::type_name;

use criterion::measurement::Measurement;
use criterion::{BenchmarkGroup, BenchmarkId};
use ff::{Field, PrimeField};
use halo2curves::{bn256, pairing, CurveExt};
use pairing::Engine;
use rand_core::OsRng;

fn bench_add_ff<F: PrimeField, M: Measurement>(c: &mut BenchmarkGroup<'_, M>) {
    c.bench_function("add_ff", |b| {
        let lhs = F::random(OsRng);
        let rhs = F::random(OsRng);
        b.iter(|| black_box(lhs) + black_box(rhs));
    });
}

fn bench_mul_ff<F: PrimeField, M: Measurement>(c: &mut BenchmarkGroup<'_, M>) {
    c.bench_function("mul_ff", |b| {
        let lhs = F::random(OsRng);
        let rhs = F::random(OsRng);
        b.iter(|| black_box(lhs) * black_box(rhs));
    });
}

fn bench_add_ec<G: CurveExt, M: Measurement>(c: &mut BenchmarkGroup<'_, M>) {
    let group_name = type_name::<G>().split("::").last().unwrap();
    let op_name = format!("add_{}", group_name);
    c.bench_function(op_name.as_str(), |b| {
        let lhs = G::random(OsRng);
        let rhs = G::random(OsRng);
        b.iter(|| lhs.add(rhs));
    });
}

fn bench_mul_ec<G: CurveExt, M: Measurement>(c: &mut BenchmarkGroup<'_, M>) {
    let group_name = type_name::<G>().split("::").last().unwrap();
    let op_name = format!("mul_{}", group_name);
    c.bench_function(op_name.as_str(), |b| {
        let lhs = G::random(OsRng);
        let rhs = G::ScalarExt::random(OsRng);
        b.iter(|| black_box(lhs) * black_box(rhs));
    });
}

// The MSM algorithm of halo2_curve can be found here: https://github.com/privacy-scaling-explorations/halo2curves/pull/29
fn bench_msm(group: &mut BenchmarkGroup<'_, criterion::measurement::WallTime>) {
    const MAX_SIZE: usize = 21;
    let (points, scalars): (Vec<_>, Vec<_>) = (0..1<<MAX_SIZE)
        .map(|_| {
            let point = bn256::G1Affine::random(OsRng);
            let scalar = bn256::Fr::random(OsRng);
            (point, scalar)
        })
        .unzip();

    for logsize in 11..=MAX_SIZE {
        // Dynamically control sample size so that big MSMs don't bench eternally
        if logsize > 20 {
            group.sample_size(10);
        }

        let size = 1 << logsize;

        let scalars = &scalars[..size];
        let points = &points[..size];
        let mut r1 = bn256::G1::identity();

        group.bench_with_input(BenchmarkId::new("G1", size), &size, |b, _| {
            b.iter(|| {
                bn256::msm::MSM::evaluate(scalars, points, &mut r1);
            });
        });
    }
}

fn bench_pairing<M: Measurement>(c: &mut BenchmarkGroup<'_, M>) {
    c.bench_function("pairing", |r| {
        let lhs = bn256::G1Affine::random(OsRng);
        let rhs = bn256::G2Affine::random(OsRng);
        r.iter(|| bn256::Bn256::pairing(&lhs, &rhs))
    });
}

fn bench_bn256(c: &mut Criterion) {
    let mut group = c.benchmark_group("bn256");
    bench_add_ff::<bn256::Fr, _>(&mut group);
    bench_mul_ff::<bn256::Fr, _>(&mut group);
    bench_add_ec::<bn256::G1, _>(&mut group);
    bench_add_ec::<bn256::G2, _>(&mut group);
    bench_mul_ec::<bn256::G1, _>(&mut group);
    bench_mul_ec::<bn256::G2, _>(&mut group);
    bench_msm(&mut group);
    bench_pairing::<_>(&mut group);
}

criterion_group!(benches, bench_bn256);
criterion_main!(benches);