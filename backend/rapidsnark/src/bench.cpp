#include <stdio.h>
#include <stdlib.h>
#include <nanobench.h>
#include <iostream>
#include "alt_bn128.hpp"
#include "fr.hpp"

__uint128_t g_lehmer64_state = 0xAAAAAAAAAAAAAAAALL;

// Fast random generator
// https://lemire.me/blog/2019/03/19/the-fastest-conventional-random-number-generator-that-can-pass-big-crush/

uint64_t lehmer64() {
  g_lehmer64_state *= 0xda942042e4dd58b5LL;
  return g_lehmer64_state >> 64;
}

int main(int argc, char **argv) {
    int msm_lower = 10;
    int msm_upper = 11;

    Fr_init();

    // Prepare Fr_add
    FrElement add_a;
    add_a.type = Fr_LONGMONTGOMERY;
    for (int i=0; i<Fr_N64; i++) {
        add_a.longVal[i] = 0xAAAAAAAA;
    }

    // Prepare Fr_mul
    FrElement mul_a;
    mul_a.type = Fr_LONGMONTGOMERY;
    for (int i=0; i<Fr_N64; i++) {
        mul_a.longVal[i] = 0xAAAAAAAA;
    }


    ankerl::nanobench::Bench bench = ankerl::nanobench::Bench().performanceCounters(true).minEpochIterations(10)
    .output(nullptr) // surpress the table output
    .run("Fr_add", [&]() {
        FrElement result;
        Fr_add(&result, &add_a, &add_a);
    })
    .run("Fr_mul", [&]() {
        Fr_mul(&mul_a, &mul_a, &mul_a);
    });

    // MSM_G1
    for (int X=msm_lower; X<=msm_upper; X++) {
        // Prepare MSM_G1
        uint8_t *scalars = new uint8_t[X*32];
        AltBn128::G1PointAffine *bases = new AltBn128::G1PointAffine[X];

        // random scalars
        for (int i=0; i<X*4; i++) {
            *((uint64_t *)(scalars + i*8)) = lehmer64();
        }

        AltBn128::G1.copy(bases[0], AltBn128::G1.one());
        AltBn128::G1.copy(bases[1], AltBn128::G1.one());

        for (int i=2; i<X; i++) {
            AltBn128::G1.add(bases[i], bases[i-1], bases[i-2]);
        }

        AltBn128::G1Point p1;

        #ifdef COUNT_OPS
            AltBn128::G1.resetCounters();
        #endif

        bench.run("msm_g1::" + std::to_string(X), [&]() {
            AltBn128::G1.multiMulByScalar(p1, bases, (uint8_t *)scalars, 32, X);
        });
    }

    // MSM_G2
    for (int X=msm_lower; X<=msm_upper; X++) {
        // Prepare MSM_G2
        uint8_t *scalars = new uint8_t[X*32];
        AltBn128::G2PointAffine *bases = new AltBn128::G2PointAffine[X];

        // random scalars
        for (int i=0; i<X*4; i++) {
            *((uint64_t *)(scalars + i*8)) = lehmer64();
        }

        AltBn128::G2.copy(bases[0], AltBn128::G2.one());
        AltBn128::G2.copy(bases[1], AltBn128::G2.one());

        for (int i=2; i<X; i++) {
            AltBn128::G2.add(bases[i], bases[i-1], bases[i-2]);
        }

        AltBn128::G2Point p1;

        #ifdef COUNT_OPS
            AltBn128::G2.resetCounters();
        #endif

        bench.run("msm_g2::" + std::to_string(X), [&]() {
            AltBn128::G2.multiMulByScalar(p1, bases, (uint8_t *)scalars, 32, X);
        });
    }
    bench.render(ankerl::nanobench::templates::json(), std::cout);


    return 0;
}
