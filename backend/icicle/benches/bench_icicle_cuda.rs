use criterion::{criterion_group, criterion_main, Criterion};
use icicle_benchmarks::{
    bench_add, bench_add_scalars, bench_double, bench_fft, bench_inv_scalars, bench_msm, bench_mul,
    bench_mul_scalars, bench_pairing, bench_square_scalars, bench_sub, bench_sub_scalars,
};
use icicle_runtime::Device;

macro_rules! bench_curve {
    ($name: ident, $lib: path, $id: expr) => {
        fn $name(c: &mut Criterion) {
            use $lib::{
                curve::CurveCfg, curve::G2CurveCfg, curve::ScalarCfg, curve::ScalarField,
                pairing::PairingTargetField,
            };

            let _ = icicle_runtime::load_backend_from_env_or_default();
            icicle_runtime::set_device(&Device::new("CUDA", 0))
                .expect("Failed to set device to GPU");
            let mut group = c.benchmark_group($id);
            // bench_add_scalars::<ScalarField, ScalarCfg, _>(&mut group, "ff");
            // bench_sub_scalars::<ScalarField, ScalarCfg, _>(&mut group, "ff");
            // bench_mul_scalars::<ScalarField, ScalarCfg, _>(&mut group, "ff");
            // bench_square_scalars::<ScalarField, ScalarCfg, _>(&mut group, "ff");
            // bench_inv_scalars::<ScalarField, ScalarCfg, _>(&mut group, "ff");

            // bench_add::<CurveCfg, ScalarCfg, _>(&mut group, "G1");
            // bench_add::<G2CurveCfg, ScalarCfg, _>(&mut group, "G2");
            // bench_sub::<CurveCfg, ScalarCfg, _>(&mut group, "G1");
            // bench_sub::<G2CurveCfg, ScalarCfg, _>(&mut group, "G2");
            // bench_double::<CurveCfg, ScalarCfg, _>(&mut group, "G1");
            // bench_double::<G2CurveCfg, ScalarCfg, _>(&mut group, "G2");
            // bench_mul::<CurveCfg, ScalarCfg, _>(&mut group, "G1");
            // bench_mul::<G2CurveCfg, ScalarCfg, _>(&mut group, "G2");
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
