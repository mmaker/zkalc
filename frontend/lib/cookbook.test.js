import { test } from 'vitest'
import { estimates, estimator } from './estimates';
import { humanTime } from './time';


test('estimation_error', () => {
    for (let curve in estimates) {
        for (let library in estimates[curve]) {
            for (let machine in estimates[curve][library]) {
                const file = "../data/" + estimates[curve][library][machine];
                const controlFile = file.slice(0, -".json".length) + "-control.json";
                var controlData;
                try {
                    controlData = require(controlFile);
                } catch (ex) {
                    continue;
                }
                for (let op in controlData) {
                    controlData[op].range.map((n, i) => {
                        const controlResult = controlData[op].results[i];
                        // const controlStdDev = controlData[op].stddev[i];
                        const estimatedResult = estimator(curve, library, machine, op)(n);
                        if (estimatedResult !== null) {
                            const error = Math.abs(controlResult - estimatedResult) / controlResult * 100;
                            console.log(curve, library, machine, op, n, error.toFixed(2) + "%", humanTime(controlResult - estimatedResult))
                        }


                    })

                }
            }
        }
    }
})
// test('zkp_estimation_error', () => {
//     let results = require('./../result.json');
//     results
//         .filter((sample) => sample.framework === "gnark" && (sample.operation === "prove" || sample.operation === "verify"))
//         .map((sample) => {
//         const curve = sample.curve;
//         const operation = sample.operation;
//         const circuit = {
//             'constraints': sample.nbConstraints,
//             'instance_size': sample.nbPublic,
//             'witness_size': sample.nbSecret,
//         };
//         const expected = sample['time(ms)'] * 1000000;
//         let e = (op) => estimator(curve, "gnark_crypto", "aws_m5.2xlarge", op);
//         const got = cookbook.groth16[operation](e, circuit);
//         const relative_error = Math.abs(expected - got) / expected * 100;
//         console.log(`${curve} ${sample.circuit} ${operation} ${relative_error.toFixed(2)}%: ${humanTime(expected)} vs ${humanTime(got)} (${sample.input})`);
//     } )
//   })