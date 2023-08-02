import "katex/dist/katex.min.css";

import { Select, Row, Space, Typography, Dropdown } from "antd";
import { SwapOutlined, DownOutlined } from "@ant-design/icons";
import { useState } from "react";
import { Layout } from "../components/layout";
import { Plot, formatTimeTick } from "../components/plot";
import { ResponsiveBar } from "@nivo/bar";

import { getEstimates } from "../lib/estimates";
import libraries from "../data/libraries.json";
import curves from "../data/curves.json";
import defaults from "../data/defaults.json";

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
  let defaultLib = defaults.lib;
  let defaultCurve = defaults.curve;
  let defaultMachine = defaults.machine;
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
      translateX: 50,
      translateY: -20,
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
    if (fixLib) {
      return libraries_selection[curve];
    } else {
      return curves_selection;
    }
  };

  const SelectGraph = () => {
    return (
      <Row align="center">
        <Space align="baseline">
          <SwapOutlined onClick={() => setFixLib(!fixLib)} />
          <Text>
            Showing results for:
            {/* {fixLib ? `On backend ${lib}, showing results for` : `Showing results for ${curve}`} */}
          </Text>
          <Dropdown
            menu={{
              items: getParameterSelection(),
              onClick: ({ key }) => handleParamChange(key),
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                {fixLib ? libraries[lib].label : curves[curve].label}{" "}
                <DownOutlined style={{ fontSize: "10px", margin: "-10px" }} />
                &nbsp;
              </Space>
            </a>
          </Dropdown>
          <Select
            style={{ width: 200 }}
            defaultValue={op}
            options={operations_selection}
            onChange={setOp}
          />
        </Space>
      </Row>
    );
  };

  const ZkalcGraph = () => {
    let samples = getEstimates(defaultCurve, defaultLib, defaultMachine)[op];
    if (typeof samples === "undefined") {
      return <Row align={"center"}>Unavailable</Row>;
    }
    if (samples.range.length > 1) {
      return <ZkalcPlot />;
    } else {
      return <ZkalcBar />;
    }
  };

  const baseData = (f) => {
    if (fixLib) {
      return Object.keys(curves)
        .map((x) => { try { return f(getEstimates(x, lib, machine)[op], x) } catch { return null }})
        .filter((x) => x !== null);
    } else {
      return Object.keys(libraries)
        .map((x) => { try { return f(getEstimates(curve, x, machine)[op], x) } catch { return null }})
        .filter((x) => x !== null);
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
        axisLeft={{
          orient: "left",
          format: formatTimeTick(4),
          tickSize: 5,
          tickRotation: 10,
          // legend: 'time (ns)',
          legendOffset: -40,
          legendPosition: "middle",
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
    <Layout title="zcharts">
      <SelectGraph />
      <ZkalcGraph />
    </Layout>
  );
};

export default Home;
