#!/usr/bin/env node

// Measuring elliptic curve operations for ffjavascript
// import ffjs
import { buildBn128, buildBls12381, F1Field } from 'ffjavascript';
import { json } from 'stream/consumers';
import { Bench } from 'tinybench';


// Note that if we try to move the measuring in another function by passing
// field.add (or any other operation) then we get the following error:
// ffjavascript/build/main.cjs:1534
//         return res >= this.p ? res-this.p : res;
async function benchmark(curve, G, operation, count) {
    var start;
    var time;
    var hrTime;
    var x = G.F.random();
    var y = G.F.random();
    switch (operation) {
        case "scalar-multiplication":
            start = process.hrtime();
            for (let step = 0; step < count; step++) {
                var r = G.timesScalar(G.g, x)
            }
            hrTime = process.hrtime(start)
            time = hrTime[0] * 1000000000 + hrTime[1];
            return time / count; // nano seconds
        case "multi-scalar-multiplication":
            start = process.hrtime();
            const N = x;
            const scalars = new BigBuffer(N*curve.Fr.n8);
            const bases = new BigBuffer(N*G.F.n8*2);
            for (let step = 0; step < count; step++) {
                var r = await G.multiExpAffine(bases, scalars, false, "");
            }
            hrTime = process.hrtime(start)
            time = hrTime[0] * 1000000000 + hrTime[1];
            return time / count; // nano seconds
        case "pairing":
            start = process.hrtime();
            const g1 = curve.G1.timesScalar(curve.G1.g, x);
            const g2 = curve.G2.timesScalar(curve.G2.g, y);
            for (let step = 0; step < count; step++) {
                const pre1 = curve.prepareG1(g1);
                const pre2 = curve.prepareG2(g2);
                const r1 = curve.millerLoop(pre1, pre2);
                const r2 = curve.finalExponentiation(r1);
            }
            hrTime = process.hrtime(start)
            time = hrTime[0] * 1000000000 + hrTime[1];
            return time / count; // nano seconds
        default:
            throw new Error(`Operation not supported: ${operation}`);
    }
}


const operations = [
    "scalar-multiplication",
    "multi-scalar-multiplication",
    "pairing",
]

const curves = [
    buildBls12381(false),
    buildBn128(false),
]

function benchmark_add (bench, G, name) {
    const x = G.timesScalar(G.g, G.F.random());
    const y =  G.timesScalar(G.g, G.F.random());
    bench.add(name + '/add', () => {
        G.add(x, y);
    });
}

function benchmark_scalarmul(bench, G, name) {
    const x = G.F.random();
    const y =  G.timesScalar(G.g, G.F.random());
    bench.add(name + '/mul', () => {
        G.timesScalar(y, x);
    });
}

function benchmark_pairing(bench, curve, name) {
    const x = curve.Fr.random();
    const y = curve.Fr.random();
    const g1 = curve.G1.timesScalar(curve.G1.g, x);
    const g2 = curve.G2.timesScalar(curve.G2.g, y);
    bench.add(name + '/pairing', () => {
        const pre1 = curve.prepareG1(g1);
        const pre2 = curve.prepareG2(g2);
        const r1 = curve.millerLoop(pre1, pre2);
        const r2 = curve.finalExponentiation(r1);
    });
}

async function run () {
    const bench = new Bench();

    for (const curve of curves) {
        for (const operation of operations) {
            const c = await curve;
            await benchmark_add(bench, c.G1,  c.name + "/G1");
            await benchmark_add(bench, c.G2,  c.name + "/G2");
            await benchmark_scalarmul(bench, c.G1,  c.name + "/G1");
            await benchmark_scalarmul(bench, c.G2,  c.name + "/G2");
            await benchmark_pairing(bench, c, c.name + "/pairing")
        }
    }
    await bench.run();
    console.error(bench.table());
    // process.stdout.write(bench.results.map(x => JSON.stringify(x)).join('\n'));
}

run().then(() => {
    process.exit(0);
});
