function G1MsmTimeInNanoseconds(n) {
    const a = 110;
    const b = 0;
    microseconds = a * n + b;
    return microseconds * 1000;
}

function G2MsmTimeInNanoseconds(n) {
    const a = 220;
    const b = 0;
    microseconds = a * n + b;
    return microseconds * 1000;
}

function pairingProductTimeInNanoseconds(n) {
    if  (n == 1) {
        microseconds = (660 * n);
    } else {
        microseconds =  (660 * n) / Math.log2(n)
    }
    return microseconds * 1000;
}

function pairingTimeInNanoseconds(n) {
    milliseconds = 0.6 * n;
    return milliseconds * 1000 * 1000;
}

function amortizedPairingTimeInNanoseconds(n) {
    milliseconds = (0.25 * n) + 0.35;
    return milliseconds * 1000 * 1000;
}

function G1MulTimeInNanoseconds(n) {
    microseconds = 110 * n;
    return microseconds * 1000;
}

function G1AddTimeInNanoseconds(n) {
    return 50 * n;
}

function getOperationTimeAndDescription(operationName, operationSize) {
    let operationTime;
    switch (operationName) {
    case "G1_MSM":
        operationTime = G1MsmTimeInNanoseconds(operationSize);
        description = `G1 MSM of size ${operationSize}`;
        break;
    case "G2_MSM":
        operationTime = G2MsmTimeInNanoseconds(operationSize);
        description = `G2 MSM of size ${operationSize}`;
        break;
    case "Pairing_product":
        operationTime = pairingProductTimeInNanoseconds(operationSize);
        description = `Pairing product of size ${operationSize}`;
        break;
    case "Pairing":
        operationTime = pairingTimeInNanoseconds(operationSize);
        description = `${operationSize} pairing computations`;
        break;
    case "Pairing_amortized":
        operationTime = amortizedPairingTimeInNanoseconds(operationSize);
        description = `${operationSize} amortized pairing computations`;
        break;
    case "G1_add":
        operationTime = G1AddTimeInNanoseconds(operationSize);
        description = `${operationSize} G1 point additions`;
        break;
    case "G1_mul":
        operationTime = G1MulTimeInNanoseconds(operationSize);
        description = `${operationSize} G1 scalar multiplications`;
        break;
    }

    return [operationTime, description];
}
