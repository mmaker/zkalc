'use client'

import React, { useEffect } from "react";

import "katex/dist/katex.min.css";

import {
  PlusOutlined,
  DownOutlined,
} from "@ant-design/icons";
import {
  Col,
  Input,
  Row,
  Space,
  Tooltip,
  Typography,
  Dropdown,
} from "antd";

import { Layout } from "../../components/layout";
import { estimator, estimates } from "../../lib/estimates";
import { humanTime, siTime } from "../../lib/time";
import {
  machines_selection,
  libraries_selection,
  curves_selection,
} from "../../lib/selections";
import {
  cookbook,
} from "../../lib/cookbook";
import { parseLinearCombination } from "../../lib/sigma";

import curves from "../../data/curves.json";
import libraries from "../../data/libraries.json";
import machines from "../../data/machines.json";
import defaults from "../../data/defaults.json";

const { Text } = Typography;


const HomePage = () => {
  let ingredientsList = React.useRef(null);

  useEffect(() => {
    //   document.getElementById("title").setAttribute('onClick', "resetRecipe");
    //   renderMathInElement(ingredientsList.current, katex_settings);
    window.estimator = estimator;
    window.estimates = estimates;
    window.cookbook = cookbook;
  });
  const [inputValue, setInputValue] = React.useState("");
  const [cfg, setCfg] = React.useState(defaults);
  const [humanTimeFormat, setHumanTimeFormat] = React.useState(true);


  const formatTime = (num) => (humanTimeFormat ? humanTime : siTime)(num);

  const estimatedTimeForSigma = (inputValue) => {
      const est = (op) => estimator(
        cfg.curve,
        cfg.lib,
        cfg.machine,
        op
      );
      let parsed = parseLinearCombination(inputValue);
      if (parsed.error) {
        return parsed.error;
      } else  {
        const estimated_time = cookbook.schnorr.prove(est, parsed.num_scalars, parsed.num_equations);
        return formatTime(estimated_time);
      }
  };


  const handleLibChange = (new_lib) => {
    // UX choice: make it easy to see differences between implementations
    // resetRecipe();

    // if (new_lib in estimates[curve]) {
    //   setLib(new_lib);
    // }

    // assume curve is already selected and valid
    let new_curve = cfg.curve;
    let new_machine = cfg.machine;

    if (!(new_machine in estimates[new_curve][new_lib])) {
      new_machine = machines_selection[new_curve][new_lib].filter(
        (x) => !x.disabled
      )[0].key;
    }

    setCfg({ curve: new_curve, lib: new_lib, machine: new_machine });
  };

  const handleCurveChange = (new_curve) => {
    let new_lib = cfg.lib;
    let new_machine = cfg.machine;

    if (!(new_lib in estimates[new_curve])) {
      new_lib = libraries_selection[new_curve].filter((x) => !x.disabled)[0]
        .key;
    }

    if (!(new_machine in estimates[new_curve][new_lib])) {
      new_machine = machines_selection[new_curve][new_lib].filter(
        (x) => !x.disabled
      )[0].key;
    }

    setCfg({ curve: new_curve, lib: new_lib, machine: new_machine });
  };

  const handleMachineChange = (new_machine) => {
    setCfg({ curve: cfg.curve, lib: cfg.lib, machine: new_machine });
  };

  const BackendSelection = () => {
    const lib = cfg.lib;
    const curve = cfg.curve;
    const machine = cfg.machine;

    return (
      <>
        Estimating &nbsp;
        <Dropdown
          menu={{
            items: curves_selection,
            onClick: ({ key }) => handleCurveChange(key),
          }}
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              {curves[curve].label}
              <DownOutlined style={{ fontSize: "10px", margin: "-10px" }} />
              &nbsp;
            </Space>
          </a>
        </Dropdown>
        implemented in &nbsp;
        <Tooltip
          placement="top"
          title={`${libraries[lib].label} v${libraries[lib].version}`}
        >
          <Dropdown
            menu={{
              items: libraries_selection[curve],
              onClick: ({ key }) => handleLibChange(key),
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                {libraries[lib].label}
                <DownOutlined style={{ fontSize: "10px", margin: "-10px" }} />
                &nbsp;
              </Space>
            </a>
          </Dropdown>
        </Tooltip>
        using &nbsp;
        <Tooltip
          placement="top"
          title={` ${machines[machine].os} ${machines[machine].cpu}, ${machines[machine].ram}`}
          styles={{
            width: machines[machine].tooltip_width,
          }}
        >
          <Dropdown
            menu={{
              items: machines_selection[curve][lib],
              onClick: ({ key }) => handleMachineChange(key),
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                {machines[machine].label}
                <DownOutlined style={{ fontSize: "10px", margin: "-10px" }} />
                &nbsp;
              </Space>
            </a>
          </Dropdown>
        </Tooltip>
      </>
    );
  };
  return (
    <Layout onClickTitle={() => {}}>
    <Row align="center">
      <Text align="center" fontSize={20} color="#999">
        <BackendSelection />
      </Text>
    </Row><Row align="center" style={{ marginBottom: '20px' }}>
    <Col span={16}>
      <Input.TextArea
        rows={4}
        placeholder="PEDERSEN(G0, G1, G2, G3, X, Y) = PoK{(x0, x1): X = x0 * G0 + x1 * G1, Y = x0 * G2 + x1 * G3})"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
      />
    </Col>
  </Row>
      <br />
      <br />
      <Row align="center" span={24}>
        <Col span={8} offset={4}>
          <Typography.Paragraph align="right">
            <Text strong>Total time:&nbsp;&nbsp;</Text>
            <Text italic onClick={() => setHumanTimeFormat(!humanTimeFormat)}>
              {estimatedTimeForSigma(inputValue)}
            </Text>
          </Typography.Paragraph>
        </Col>
      </Row>
    </Layout>
  );
};

export default HomePage;
