use criterion::measurement::Measurement;
use criterion::{criterion_group, criterion_main, BenchmarkGroup};
use criterion::{BenchmarkId, Criterion};
use icicle_core::curve::{Curve, Projective};
use icicle_core::field::FieldArithmetic;
use icicle_core::msm::{msm, MSMConfig, MSM};
use icicle_core::ntt::{self, NTTConfig, NTTDir, NTTDomain, NTT};
use icicle_core::pairing::Pairing;
use icicle_core::traits::{FieldImpl, GenerateRandom};
use icicle_runtime::memory::HostSlice;

fn bench_msm<C: Curve + MSM<C>, FC: GenerateRandom<C::ScalarField>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    for logsize in 1..=21 {
        let size = 1 << logsize;

        c.bench_with_input(
            BenchmarkId::new(format!("msm_{}", group_name), size),
            &logsize,
            |b, _| {
                let scalars = FC::generate_random(size);
                let gs = C::generate_random_affine_points(size);
                let mut result = vec![Projective::<C>::zero(); 1];
                let config = MSMConfig::default();
                b.iter(|| {
                    msm::<C>(
                        HostSlice::from_slice(&scalars),
                        HostSlice::from_slice(&gs),
                        &config,
                        HostSlice::from_mut_slice(&mut result),
                    )
                });
            },
        );
    }
}

fn bench_add<C: Curve, FC: GenerateRandom<C::ScalarField>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    c.bench_function(format!("add_{}", group_name), |b| {
        let lhs = C::generate_random_projective_points(1)[0];
        let rhs = C::generate_random_projective_points(1)[0];
        b.iter(|| lhs + rhs)
    });
}

fn bench_sub<C: Curve, FC: GenerateRandom<C::ScalarField>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    c.bench_function(format!("sub_{}", group_name), |b| {
        let lhs = C::generate_random_projective_points(1)[0];
        let rhs = C::generate_random_projective_points(1)[0];
        b.iter(|| lhs - rhs)
    });
}

fn bench_double<C: Curve, FC: GenerateRandom<C::ScalarField>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    c.bench_function(format!("double_{}", group_name), |b| {
        let lhs = C::generate_random_projective_points(1)[0];
        b.iter(|| lhs + lhs)
    });
}

fn bench_mul<C: Curve, FC: GenerateRandom<C::ScalarField>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    c.bench_function(format!("mul_{}", group_name), |b| {
        let lhs = C::generate_random_projective_points(1)[0];
        let rhs = FC::generate_random(1)[0];
        b.iter(|| lhs * rhs)
    });
}

fn bench_add_scalars<F: FieldImpl + std::ops::Add, FC: GenerateRandom<F>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    c.bench_function(format!("add_{}", group_name), |b| {
        let lhs = FC::generate_random(1)[0];
        let rhs = FC::generate_random(1)[0];
        b.iter(|| lhs + rhs)
    });
}

fn bench_sub_scalars<F: FieldImpl + std::ops::Sub, FC: GenerateRandom<F>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    c.bench_function(format!("sub_{}", group_name), |b| {
        let lhs = FC::generate_random(1)[0];
        let rhs = FC::generate_random(1)[0];
        b.iter(|| lhs - rhs)
    });
}

fn bench_mul_scalars<F: FieldImpl + std::ops::Mul, FC: GenerateRandom<F>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    c.bench_function(format!("mul_{}", group_name), |b| {
        let lhs = FC::generate_random(1)[0];
        let rhs = FC::generate_random(1)[0];
        b.iter(|| lhs * rhs)
    });
}

fn bench_square_scalars<F: FieldImpl + std::ops::Mul, FC: GenerateRandom<F>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    c.bench_function(format!("square_{}", group_name), |b| {
        let lhs = FC::generate_random(1)[0];
        b.iter(|| lhs * lhs)
    });
}

fn bench_inv_scalars<F: FieldImpl, FC: FieldArithmetic<F> + GenerateRandom<F>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    c.bench_function(format!("inv_{}", group_name), |b| {
        let lhs = FC::generate_random(1)[0];
        b.iter(|| FC::inv(lhs))
    });
}

fn bench_pairing<C1: Curve + Pairing<C1, C2, F>, C2: Curve, F: FieldImpl, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
) {
    c.bench_function("pairing", |r| {
        let p = C1::generate_random_affine_points(1)[0];
        let q = C2::generate_random_affine_points(1)[0];
        r.iter(|| C1::pairing(&p, &q))
    });
}

fn bench_fft<F: FieldImpl, M: Measurement>(c: &mut BenchmarkGroup<'_, M>)
where
    F::Config: NTT<F, F> + NTTDomain<F> + GenerateRandom<F>,
{
    F::Config::initialize_domain(
        ntt::get_root_of_unity::<F>((1 << 21).try_into().unwrap()),
        &ntt::NTTInitDomainConfig::default(),
    )
    .unwrap();
    for logsize in 1..=21 {
        let size = 1 << logsize;
        c.bench_with_input(BenchmarkId::new("fft", size), &logsize, |b, _| {
            let a = F::Config::generate_random(size);
            let config = NTTConfig::<F>::default();
            let mut ntt_results = vec![F::zero(); size];
            b.iter(|| {
                ntt::ntt(
                    HostSlice::from_slice(&a),
                    NTTDir::kForward,
                    &config,
                    HostSlice::from_mut_slice(&mut ntt_results),
                )
            })
        });
    }
}

macro_rules! bench_curve {
    ($name: ident, $lib: path, $id: expr) => {
        fn $name(c: &mut Criterion) {
            use $lib::{
                curve::CurveCfg, curve::G2CurveCfg, curve::ScalarCfg, curve::ScalarField,
                pairing::PairingTargetField,
            };

            let mut group = c.benchmark_group($id);
            bench_add_scalars::<ScalarField, ScalarCfg, _>(&mut group, "ff");
            bench_sub_scalars::<ScalarField, ScalarCfg, _>(&mut group, "ff");
            bench_mul_scalars::<ScalarField, ScalarCfg, _>(&mut group, "ff");
            bench_square_scalars::<ScalarField, ScalarCfg, _>(&mut group, "ff");
            bench_inv_scalars::<ScalarField, ScalarCfg, _>(&mut group, "ff");

            bench_add::<CurveCfg, ScalarCfg, _>(&mut group, "G1");
            bench_add::<G2CurveCfg, ScalarCfg, _>(&mut group, "G2");
            bench_sub::<CurveCfg, ScalarCfg, _>(&mut group, "G1");
            bench_sub::<G2CurveCfg, ScalarCfg, _>(&mut group, "G2");
            bench_double::<CurveCfg, ScalarCfg, _>(&mut group, "G1");
            bench_double::<G2CurveCfg, ScalarCfg, _>(&mut group, "G2");
            bench_mul::<CurveCfg, ScalarCfg, _>(&mut group, "G1");
            bench_mul::<G2CurveCfg, ScalarCfg, _>(&mut group, "G2");
            bench_msm::<CurveCfg, ScalarCfg, _>(&mut group, "G1");
            bench_msm::<G2CurveCfg, ScalarCfg, _>(&mut group, "G2");
            bench_pairing::<CurveCfg, G2CurveCfg, PairingTargetField, _>(&mut group);
            bench_fft::<ScalarField, _>(&mut group);
            group.finish();
        }
    };
}

bench_curve!(bench_bn254, icicle_bn254, "bn254");
bench_curve!(bench_bls12_381, icicle_bls12_381, "bls12_381");
bench_curve!(bench_bls12_377, icicle_bls12_377, "bls12_377");

criterion_group!(benches, bench_bls12_377, bench_bls12_381, bench_bn254,);
criterion_main!(benches);
