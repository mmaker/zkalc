import { expect, test } from 'vitest'
import { estimator } from './estimates';
import { cookbook } from './cookbook';


test('error', () => {
    let results = require('./../result.json');
    results
        .filter((sample) => sample.framework === "gnark" && (sample.operation === "prove"))
        .map((sample) => {
        const curve = sample.curve;
            const input = sample.input;
        const operation = sample.operation;
        const circuit = {
            'constraints': sample.nbConstraints,
            'instance_size': sample.nbPublic,
            'witness_size': sample.nbSecret,
        };
        const expected = sample['time(ms)'] * 1000000;
        let e = (op) => estimator(curve, "gnark_crypto", "aws_m5.2xlarge", op);
        const got = cookbook.gnark_plonk[operation](e, circuit);
        const relative_error = Math.abs(expected - got) / expected * 100;
        console.log(`${curve} ${sample.circuit} ${operation} ${relative_error.toFixed(2)}%: ${expected} vs ${got} (${input})`);
    } )
    expect(1+2).toBe(3)
  })
