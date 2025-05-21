use criterion::measurement::Measurement;
use criterion::{BenchmarkGroup, BenchmarkId};
use icicle_core::curve::{Curve, Projective};
use icicle_core::field::FieldArithmetic;
use icicle_core::msm::{msm, MSMConfig, MSM};
use icicle_core::ntt::{self, NTTConfig, NTTDir, NTTDomain, NTT};
use icicle_core::pairing::Pairing;
use icicle_core::traits::{FieldImpl, GenerateRandom};
use icicle_runtime::memory::{DeviceSlice, DeviceVec, HostSlice};

pub fn bench_msm<C: Curve + MSM<C>, FC: GenerateRandom<C::ScalarField>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    for logsize in 1..=21 {
        let size = 1 << logsize;

        if logsize > 10 {
            c.sample_size(10);
        }

        c.bench_with_input(
            BenchmarkId::new(format!("msm_{}", group_name), size),
            &logsize,
            |b, _| {
                let scalars = FC::generate_random(size);
                let gs = C::generate_random_affine_points(size);
                let mut result = DeviceVec::device_malloc(1).unwrap();
                let config = MSMConfig::default();

                let mut device_scalars = DeviceVec::device_malloc(size).unwrap();
                device_scalars
                    .copy_from_host(HostSlice::from_slice(&scalars))
                    .unwrap();

                let mut device_gs = DeviceVec::device_malloc(size).unwrap();
                device_gs
                    .copy_from_host(HostSlice::from_slice(&gs))
                    .unwrap();

                b.iter(|| msm::<C>(&device_scalars, &device_gs, &config, &mut result));
            },
        );
    }
}

pub fn bench_add<C: Curve, FC: GenerateRandom<C::ScalarField>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    c.bench_function(format!("add_{}", group_name), |b| {
        let lhs = C::generate_random_projective_points(1)[0];
        let rhs = C::generate_random_projective_points(1)[0];
        b.iter(|| lhs + rhs)
    });
}

pub fn bench_sub<C: Curve, FC: GenerateRandom<C::ScalarField>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    c.bench_function(format!("sub_{}", group_name), |b| {
        let lhs = C::generate_random_projective_points(1)[0];
        let rhs = C::generate_random_projective_points(1)[0];
        b.iter(|| lhs - rhs)
    });
}

pub fn bench_double<C: Curve, FC: GenerateRandom<C::ScalarField>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    c.bench_function(format!("double_{}", group_name), |b| {
        let lhs = C::generate_random_projective_points(1)[0];
        b.iter(|| lhs + lhs)
    });
}

pub fn bench_mul<C: Curve, FC: GenerateRandom<C::ScalarField>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    c.bench_function(format!("mul_{}", group_name), |b| {
        let lhs = C::generate_random_projective_points(1)[0];
        let rhs = FC::generate_random(1)[0];
        b.iter(|| lhs * rhs)
    });
}

pub fn bench_add_scalars<F: FieldImpl + std::ops::Add, FC: GenerateRandom<F>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    c.bench_function(format!("add_{}", group_name), |b| {
        let lhs = FC::generate_random(1)[0];
        let rhs = FC::generate_random(1)[0];
        b.iter(|| lhs + rhs)
    });
}

pub fn bench_sub_scalars<F: FieldImpl + std::ops::Sub, FC: GenerateRandom<F>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    c.bench_function(format!("sub_{}", group_name), |b| {
        let lhs = FC::generate_random(1)[0];
        let rhs = FC::generate_random(1)[0];
        b.iter(|| lhs - rhs)
    });
}

pub fn bench_mul_scalars<F: FieldImpl + std::ops::Mul, FC: GenerateRandom<F>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    c.bench_function(format!("mul_{}", group_name), |b| {
        let lhs = FC::generate_random(1)[0];
        let rhs = FC::generate_random(1)[0];
        b.iter(|| lhs * rhs)
    });
}

pub fn bench_square_scalars<F: FieldImpl + std::ops::Mul, FC: GenerateRandom<F>, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    c.bench_function(format!("square_{}", group_name), |b| {
        let lhs = FC::generate_random(1)[0];
        b.iter(|| lhs * lhs)
    });
}

pub fn bench_inv_scalars<
    F: FieldImpl,
    FC: FieldArithmetic<F> + GenerateRandom<F>,
    M: Measurement,
>(
    c: &mut BenchmarkGroup<'_, M>,
    group_name: &str,
) {
    c.bench_function(format!("inv_{}", group_name), |b| {
        let lhs = FC::generate_random(1)[0];
        b.iter(|| FC::inv(lhs))
    });
}

pub fn bench_pairing<C1: Curve + Pairing<C1, C2, F>, C2: Curve, F: FieldImpl, M: Measurement>(
    c: &mut BenchmarkGroup<'_, M>,
) {
    c.bench_function("pairing", |r| {
        let p = C1::generate_random_affine_points(1)[0];
        let q = C2::generate_random_affine_points(1)[0];
        r.iter(|| C1::pairing(&p, &q))
    });
}

pub fn bench_fft<F: FieldImpl, M: Measurement>(c: &mut BenchmarkGroup<'_, M>)
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
            let mut device_a = DeviceVec::device_malloc(size).unwrap();
            device_a.copy_from_host(HostSlice::from_slice(&a)).unwrap();
            let config = NTTConfig::<F>::default();
            let mut ntt_results = DeviceVec::device_malloc(size).unwrap();
            b.iter(|| ntt::ntt(&device_a, NTTDir::kForward, &config, &mut ntt_results))
        });
    }
}
