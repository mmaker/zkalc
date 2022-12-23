// The cryptographic operation specific code is in ./operations.js

function describeTimeInNanoseconds(nanoseconds) {
    microseconds = nanoseconds / 1000;
    milliseconds = microseconds / 1000;
    seconds = milliseconds / 1000;
    minutes = seconds / 60;
    hours = minutes / 60;

    if (nanoseconds < 1000) {
        return `${nanoseconds.toFixed(2)} nanoseconds`;
    } else if (microseconds < 1000) {
        return `${microseconds.toFixed(2)} microseconds`;
    } else if (milliseconds < 1000) {
        return `${milliseconds.toFixed(2)} milliseconds`;
    } else if (seconds < 60) {
        return `${seconds.toFixed(2)} seconds`;
    } else if (minutes < 60) {
        return `${minutes.toFixed(2)} minutes`;
    } else {
        return `${hours.toFixed(2)} hours`;
    }
}

let total = 0;
const operationsList = document.getElementById("operationsList");
const operations = document.getElementsByTagName("li");

function addOperation() {
    const operationName = document.getElementById("operationName").value;
    const operationSize = document.getElementById("operationSize").value;

    [operationTime, description] = getOperationTimeAndDescription(operationName, operationSize)
    total += parseFloat(operationTime);

    const text = document.createTextNode(`${description}: ${describeTimeInNanoseconds(operationTime)}`);

    const operationElement = document.createElement("li");
    operationElement.appendChild(text);
    // Add a tooltip
    operationElement.title = `Time: {operationTime}`;
    operationsList.appendChild(operationElement);

    document.getElementById("totalTime").innerHTML = `Total time: ${describeTimeInNanoseconds(total)}`;
}

function resetCalculation() {
    document.getElementById("totalTime").innerHTML = "";

    // Need to reset that to its initial form (otherwise it also wipes totalTime)
    operationsList.innerHTML = `<span id="totalTime"></span>`;
}
