import { ResponsiveLine } from "@nivo/line";
import { InlineMath } from "react-katex";
import { humanTime } from "../lib/time";
import { area, curveMonotoneX } from "d3-shape";

import { estimates, estimator } from "../lib/estimates";
import { filterSamples, samplesToPlotData } from "../lib/samples";
import defaults from "../data/defaults.json";

const tooltipStyle = {
  border: "2px solid",
  borderRadius: "5px",
  padding: "2px",
  fontSize: 10,
  // fontWeight: "bold",
  boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
  marginBottom: "2px",
};

const linspace = (start, stop, num) => {
  const step = (stop - start) / num;
  return Array.from({ length: num }, (_, i) => start + step * i);
};

const geomspace = (start, stop, num) => {
  const step = (Math.log(stop) - Math.log(start)) / num;
  return Array.from({ length: num }, (_, i) =>
    Math.exp(Math.log(start) + step * i)
  );
};

export const formatTimeTick = (n) => {
  return (v) => `${(v / 1e9).toFixed(n)} s`;
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
  return { id, data: [...xys] }; // , color: "#f47560"
};

const tooltipElement = (props) => {
  const time = humanTime(props.point.data.y);
  return (
    <div style={tooltipStyle}>
      {"x: "}
      <InlineMath math={`2^{${Math.log2(props.point.data.x).toFixed(0)}}`} />
      {", y: "}
      {time}
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
      // points={data.map((d) => `${xScale(d.data.x)},${yScale(d.data.y)}`)}
      style={msmStyleById[id] || msmStyleById.default}
    />
  ));
};

const msmStyleById = {
  estimated: {
    strokeWidth: 1,
  },
  extrapolation: {
    strokeWidth: 1.5,
  },
  datapoints: {
    strokeWidth: 0,
  },
  interpolation: {
    strokeDasharray: "12, 6",
    strokeWidth: 3,
  },
  default: {
    strokeWidth: 1,
  },
};


export const PlotPointsAndEstimates = ({ ...kwargs }) => {
  let lib = defaults.lib;
  let curve = defaults.curve;
  let machine = defaults.machine;
  let op = "msm_G1";
  let samples = estimates[curve][lib][machine][op];

  let smaller_samples = filterSamples(
    samples,
    ([i, x, y]) => x > 2 && x < 1 << 22
  );
  let points = samplesToPlotData(smaller_samples, "datapoints");
  let estimator_f = estimator(curve, lib, machine, op);
  let estimations = functionToPlotData(
    smaller_samples.range,
    estimator_f,
    "estimated"
  );

  let data = [points, estimations];
  return (
    <Plot
      {...kwargs}
      data={data}
      height={400}
      pointBorderWidth={1}
      pointBorderColor={{ from: "serieColor" }}
      yScale={{
        type: "log",
        base: 2,
        min: "auto",
        max: "auto",
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
    />
  );
};

export const PlotExtrapolation = ({ ...kwargs }) => {
  let lib = defaults.lib;
  let curve = defaults.curve;
  let machine = defaults.machine;
  let op = "msm_G1";
  let samples = estimates[curve][lib][machine][op];
  const start = 1 << 2;
  const end = 1 << 30;

  let smaller_samples = filterSamples(samples, ([i, x, y]) => x >= start);
  let range = geomspace(start, end, 20);
  let points = samplesToPlotData(smaller_samples, "interpolation");
  let estimator_f = estimator(curve, lib, machine, op);

  let extrapolation_range = geomspace(1 << 21, end, 100);
  let estimations = functionToPlotData(
    extrapolation_range,
    estimator_f,
    "extrapolation"
  );

  let data = [points, estimations];
  return (
    <Plot
      {...kwargs}
      data={data}
      height={400}
      yScale={{
        type: "log",
        base: 2,
        stacked: false,
        min: "auto",
        max: "auto",
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
      lineWidth={100}
      enablePoints={false}
      pointBorderWidth={2}
      pointColor={{ theme: "background" }}
      pointBorderColor={{ from: "serieColor" }}
      markers={[
        {
          axis: "x",
          value: 2 ** 21,
          lineStyle: { stroke: "#b0413e", strokeWidth: 2, opacity: 0.5 },
          textStyle: {
            fill: "#b0413e",
            fontWeight: "bold",
            fontSize: 10,
            opacity: 0.5,
          },
          legendOffsetY: 160,
          legend: "Extrapolation starts here",
          legendOrientation: "vertical",
        },
      ]}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};

export const PlotPoints = ({ ...kwargs }) => {
  let samples = estimates[defaults.curve][defaults.lib][defaults.machine]["msm_G1"];
  let smaller_samples = filterSamples(
    samples,
    ([i, x, y]) => x > 2 && x < 1 << 22
  );
  let points = samplesToPlotData(smaller_samples, "datapoints");
  let data = [points];
  return (
    <Plot
      {...kwargs}
      data={data}
      height={400}
      yScale={{
        type: "log",
        base: 2,
        min: "auto",
        max: "auto",
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
      lineWidth={1}
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
        // yScale={{
        //     type: 'log',
        //     base: 2,
        //     min: 16,
        //     max: 'auto',
        // }}
        axisLeft={{
          orient: "left",
          format: formatTimeTick(2),
          tickSize: 5,
          tickRotation: 10,
          // legend: 'time (ns)',
          legendOffset: -40,
          legendPosition: "middle",
        }}
        useMesh={true}
        {...kwargs}
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
