import "katex/dist/katex.min.css";

import { Select, Row, Space, Typography } from "antd";
import { SwapOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Layout } from "../components/layout";
import { Plot } from "../components/plot";
import { ResponsiveBar } from "@nivo/bar";

import { estimates, estimator } from "../lib/estimates";
import libraries from "../data/libraries.json";
import curves from "../data/curves.json";
import {
  filterSamples,
  samplesToBarData,
  samplesToPlotData,
} from "../lib/samples";

import {
  libraries_selection,
  operations,
  operations_selection,
  curves_selection,
} from "../lib/selections";
import { humanTime } from "../lib/time";

const { Text } = Typography;
const compStrategyOptions = [
  { value: false, label: "Fix curve to:" },
  { value: true, label: "Fix library to" },
];

const Home = () => {
  let defaultLib = "arkworks";
  let defaultCurve = "bls12_381";
  let defaultMachine = "ec2c59xlarge";
  let defaultOp = "msm_G1";
  let defaultFixLib = false;

  let [curve, setCurve] = useState(defaultCurve);
  let [lib, setLib] = useState(defaultLib);
  let [machine, setMachine] = useState(defaultMachine);
  let [op, setOp] = useState(defaultOp);
  let [fixLib, setFixLib] = useState(defaultFixLib);

  const theme = {
    labels: { text: { fontSize: 11 } },
    axis: {
      ticks: { text: { fontSize: 11, fill: "grey" } },
    },
  };

  const legend = [
    {
      anchor: "bottom-right",
      direction: "column",
      justify: false,
      translateX: 100,
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
  ];

  const handleParamChange = (value) => {
    if (fixLib) {
      setLib(value);
    } else {
      setCurve(value);
    }
  };

  const getParameterSelection = () => {
    if (!fixLib) {
      return curves_selection[lib];
    } else {
      return libraries_selection[curve];
    }
  };


  const SelectGraph = () => {
    return (
    <Row align="center">
      <Space align="baseline">
    <SwapOutlined onClick={() => setFixLib(!fixLib)} />
    <Text>
      {fixLib ? `Showing results for ${lib}` : `Showing results for ${curve}`}
    </Text>
    {/* <Select
      width={200}
      options={getParameterSelection()}
      defaultValue={fixLib ? lib : curve}
      onChange={handleParamChange}
    /> */}
    <Select
      style={{width: 200}}
      defaultValue={op}
      options={operations_selection}
      onChange={setOp}
    />
    </Space>
    </Row>);
  };


  const ZkalcGraph = () => {
    let samples = estimates[defaultCurve][defaultLib][defaultMachine][op];
    if (samples.range.length > 1) {
      return <ZkalcPlot />;
    } else {
      return <ZkalcBar />;
    }
  };

  const baseData = (f) => {
    if (fixLib) {
      return Object.keys(curves)
        .filter((x, i) => {
          return lib in estimates[x];
        })
        .map((x, i) => f(estimates[x][lib][machine][op], x));
    } else {
      return Object.keys(libraries)
        .filter((x) => x in estimates[curve])
        .map((x, i) => f(estimates[curve][x][machine][op], x));
    }
  };

  const ZkalcPlot = () => {
    let data = baseData(samplesToPlotData);
    return (
      <Plot
        data={data}
        height={500}
        legends={legend}
        yScale={{
          type: "log",
          base: 2,
          min: "auto",
          max: "auto",
        }}
      />
    );
  };

  const ZkalcBar = () => {
    let data = baseData(samplesToBarData);

    return (
      <div
        style={{
          height: "15em",
        }}
      >
        <ResponsiveBar
          height={150}
          width={700}
          layout="horizontal"
          margin={{
            top: 5,
            right: 5,
            bottom: 5,
            left: 105,
          }}
          data={data}
          indexBy={(_index) => _index.label + ""}
          valueFormat={(d) => humanTime(d)}
          keys={["value"]}
          colors={["#cce4f2"]}
          colorBy="indexValue"
          groupMode="grouped"
          enableGridX={false}
          enableGridY={false}
          borderRadius={1}
          padding={0.2}
          labelFormat={(d) => <tspan x={40}>{d}</tspan>}
          axisLeft={{
            tickSize: 0,
            tickPadding: 5,
            tickRotation: 0,
          }}
          axisBottom={null}
          labelTextColor="black"
          motionStiffness={170}
          motionDamping={26}
          theme={theme}
        />
      </div>
    );
  };

  return (
    <Layout>
      <SelectGraph />
      <ZkalcGraph />
    </Layout>
  );
};

export default Home;
