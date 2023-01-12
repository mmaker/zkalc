import { ResponsiveLine } from "@nivo/line";
import { InlineMath } from "react-katex";
import { humanTime } from "../lib/time";
import { area, curveMonotoneX } from "d3-shape";

import { estimates, estimator } from "../lib/estimates";

const tooltipStyle = {
  border: "2px solid",
  borderRadius: "5px",
  padding: "2px",
  fontSize: 10,
  // fontWeight: "bold",
  boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
  marginBottom: "2px",
};

export const samplesToPlotData = (samples, id = "data") => {
  const xys = samples.range.map((x, i) => ({ x: x, y: samples.results[i] }));
  return { id, data: [...xys] };
};

const linspace = (start, stop, num) => {
  const step = (stop - start) / num;
  return Array.from({ length: num }, (_, i) => start + step * i);
};

const geomspace = (start, stop, num) => {
  const step = (Math.log(stop) - Math.log(start)) / num;
  return Array.from({ length: num }, (_, i) => Math.exp(Math.log(start) + step * i));
}


const formatTimeTick = (v) => {
  return `${v / 1e9} s`;
};

const formatSizeTick = (v) => {
  return Math.log2(v).toFixed(0);
};

/// increase the density of the array by adding the middle elements
const denser = (xs) => {
  // get the middle elements
  var ys = xs.map((x, i) => {
    if (i === 0) {
      return x;
    } else {
      return (x + xs[i - 1]) / 2;
    }
  });
  ys.shift();
  // concat and sort
  return [...xs, ...ys].sort((a, b) => a - b);
};

export const functionToPlotData = (range, f, id = "foo") => {
  const xs = range;
  const xys = xs.map((x) => ({ x: x, y: f(x) }));
  return { id, data: [...xys] };
};

const tooltipElement = (props) => {
  const time = humanTime(props.point.data.y);
  return (
    <div style={tooltipStyle}>
      MSM of size{" "}
      <InlineMath math={`2^{${Math.log2(props.point.data.x).toFixed(0)}}`} />{" "}
      run in {time}
    </div>
  );
};

const SamplesPlot = ({ series, lineGenerator, xScale, yScale }) => {
  return series.map(({ id, data, color }) => (
    <path
      key={id}
      d={lineGenerator(
        data.map((d) => ({
          x: xScale(d.data.x),
          y: yScale(d.data.y),
        }))
      )}
      fill="none"
      stroke={color}
      style={msmStyleById[id] || msmStyleById.default}
    />
  ));
};

const msmStyleById = {
  estimated: {
    strokeWidth: 1,
  },
  data: {
    strokeWidth: 0,
  },
  default: {
    strokeDasharray: "12, 6",
    strokeWidth: 1,
  },
};

const filterSamples = (samples, f) => {
  let xy = samples.range.map((x, i) => [i, x, samples.results[i]]).filter(f);
  console.log(xy);
  return {
    range: xy.map((x) => x[1]),
    results: xy.map((x) => x[2]),
  };
}

export const PlotPointsAndEstimates = ({ ...kwargs }) => {
  let lib = "arkworks";
  let curve = "bls12_381";
  let machine = "m1pro";
  let op = "msm_G1";
  let samples = estimates[lib][curve][machine][op];

  let smaller_samples = filterSamples(samples, ([i, x, y]) => (x > 2 && x < (1 << 20)));
  let points = samplesToPlotData(smaller_samples, "data");
  let estimator_f = estimator(curve, lib, machine, op);
  let estimations = functionToPlotData(smaller_samples.range, estimator_f, "estimated");

  let data = [points, estimations];
  return (
    <Plot
      {...kwargs}
      data={data}
      height={400}
      yScale={{
          type: 'log',
          base: 2,
          min: 'auto',
          max: 'auto',
        }}
        axisBottom={{
          orient: "bottom",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "MSM size (log2)",
          format: formatSizeTick,
          legendOffset: 36,
          legendPosition: "middle",
        }}
      pointBorderWidth={1}
      pointBorderColor={{ from: "serieColor" }}
    />
  );
};

export const PlotExtrapolation = ({ ...kwargs }) => {
  let lib = "arkworks";
  let curve = "bls12_381";
  let machine = "m1pro";
  let op = "msm_G1";
  let samples = estimates[lib][curve][machine][op];  const start = 1 << 16;
  const end = 1 << 25;

  let smaller_samples = filterSamples(samples, ([i, x, y]) => (x >= start));
  let range = geomspace(start, end, 20);
  let points = samplesToPlotData(smaller_samples, "data");
  let estimator_f = estimator(curve, lib, machine, op);
  console.log(range);
  let estimations = functionToPlotData(range, estimator_f, "estimated");

  let data = [points, estimations];
  return (
    <Plot
      {...kwargs}
      data={data}
      height={400}
      pointBorderWidth={.5}
      pointBorderColor={{ from: "serieColor" }}
      yScale={{
          type: 'log',
          base: 2,
          stacked: false,
          min: 'auto',
          max: 'auto',
        }}
        axisBottom={{
          orient: "bottom",
          tickValues: [],
          legend: "MSM size (log2)",
          format: formatSizeTick,
          legendOffset: 36,
          legendPosition: "middle",
        }}
    />
  );
};

export const PlotPoints = ({ ...kwargs }) => {
  let samples = estimates["arkworks"]["bls12_381"]["m1pro"]["msm_G1"];
  let data = [samplesToPlotData(samples, "data")];
  return (
    <Plot
      {...kwargs}
      data={data}
      height={400}
      lineWidth={0}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      axisBottom={{
        orient: "bottom",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "MSM size (log2)",
        format: formatSizeTick,
        legendOffset: 36,
        legendPosition: "middle",
      }}
    />
  );
};

// const AreaLayer = ({ points, xScale, yScale }) => {
//     const areaGenerator = area()
//       .x(d => xScale(d.data.x))
//       .y0(d => yScale(d.data.low))
//       .y1(d => yScale(d.data.high))
//       .curve(curveMonotoneX);

//     return <path d={areaGenerator(points)} fill="rgba(140, 219, 243, .5)" />;
//   };

export const Plot = ({ data, height, ...kwargs }) => {
  return (
    // we must make sure parent container have a defined height when using
    // responsive component, otherwise height will be 0 and
    // no chart will be rendered.
    <div style={{ height: height }}>
      <ResponsiveLine
        data={data}
        margin={{ top: 30, right: 110, bottom: 70, left: 60 }}
        yScale={{
          type: "linear",
          min: "auto",
          max: "auto",
          stacked: false,
          reverse: false,
        }}
        xScale={{
          type: "log",
          base: 2,
          min: "auto",
          max: "auto",
        }}
        {...kwargs}
        // yScale={{
        //     type: 'log',
        //     base: 2,
        //     min: 16,
        //     max: 'auto',
        // }}
        yFormat=" >-.2f"
        axisLeft={{
          orient: "left",
          format: formatTimeTick,
          tickSize: 5,
          tickRotation: 10,
          // legend: 'time (ns)',
          legendOffset: -40,
          legendPosition: "middle",
        }}
        pointColor={{ theme: "background" }}
        pointLabelYOffset={-12}
        useMesh={true}
        tooltip={tooltipElement}
        layers={[
          "grid",
          "axes",
          SamplesPlot,
          "points",
          "markers",
          "mesh",
          "legends",
        ]}
      />
    </div>
  );
};
