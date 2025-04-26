import { test, expect } from 'vitest'
import { parseLinearCombination } from './sigma';

test('sigma parser', () => {
    // Test examples
    const examples = {
        "DL(X) = PoK{(x): X = x * G}": [[1, 1]],
        "DLEQ(G, H, X, Y) = PoK{(x): X = x * G, Y = x * H}": [[2, 1]],
        "PEDERSEN(G, H, C) = PoK{(x, r): C = x * G + r * H}": [[1, 2]],
        "PEDERSEN(G0, G1, G2, G3, X, Y) = PoK{(x0, x1): X = x0 * G0 + x1 * G1, Y = x0 * G2 + x1 * G3}": [[2, 2]],
        "PoK{(secret_prover_blind, msg_1, ..., msg_5): C = secret_prover_blind * Q_2 + msg_1 * J_1 + ... + msg_5 * J_5}": [[1, 6]],
    };

    Object.entries(examples).forEach(([example, expected]) => {
        const result = parseLinearCombination(example);
        // Test that the result matches the expected value
        expect([result.num_equations, result.num_scalars]).toEqual(expected[0]);
    });
})
