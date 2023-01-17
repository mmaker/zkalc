export const filterSamples = (samples, f) => {
    let xy = samples.range.map((x, i) => [i, x, samples.results[i]]).filter(f);
    return {
      range: xy.map((x) => x[1]),
      results: xy.map((x) => x[2]),
    };
  };


  export const samplesToPlotData = (samples, id = "data") => {
    const xys = samples.range.map((x, i) => ({ x: x, y: samples.results[i] }));
    return { id, data: [...xys] }; // , color: "#e8c1a0"
  };

  export const samplesToBarData = (samples,  label = "label", id = "operation") => {
    if (samples.range.length != 1) {
        throw Error("samplesToChart only supports one sample at a time")
    } else {
        return {"value": samples.results[0], "label": label, "id": id}
    }
  }