import React, { useEffect } from "react";

import "katex/dist/katex.min.css";

import { InlineMath, BlockMath } from "react-katex";
import {
  MinusCircleOutlined,
  PlusOutlined,
  DownOutlined,
  QuestionCircleOutlined,
  ExperimentOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Col,
  ConfigProvider,
  Form,
  Input,
  List,
  Radio,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
  Dropdown,
} from "antd";

import { parse, ResultSet } from "mathjs";

import { Footer } from "../components/footer";
import { Layout } from "../components/layout";
import { Recipe } from "../components/recipe";
import { estimator } from "../lib/estimates";

// import renderMathInElement from "katex/contrib/auto-render";

const { Title, Text } = Typography;

import dynamic from "next/dynamic";

///////////////////// Add your benchmarks here /////////////////////

import curves from "../data/curves.json";
import libraries from "../data/libraries.json";
import machines from "../data/machines.json";

// Import our benchmark results
import estBls12381ArkM1 from "../data/bls12-381/arkworks/m1pro.json";
import estBls12381ArkT450 from "../data/bls12-381/arkworks/t450.json";
import estBls12381BlstM1 from "../data/bls12-381/blstrs/m1pro.json";
import estBls12381BlstT450 from "../data/bls12-381/blstrs/t450.json";

const estimates = {
  blstrs: {
    bls12_381: {
      thinkpad_t450: estBls12381BlstT450,
      m1pro: estBls12381BlstM1,
    },
  },
  arkworks: {
    bls12_381: {
      thinkpad_t450: estBls12381ArkT450,
      m1pro: estBls12381ArkM1,
    },
  },
};

const operations = {
  msm_G1: {
    label: (
      <>
        MSM on <InlineMath math="\mathbb{G}_1" />
      </>
    ),
    description: (
      <>
        Multiscalar multiplication(s) over <InlineMath math="\mathbb{G}_1" />
      </>
    ),
    tooltip_width: 500,
    tooltip: (
      <>
        Given scalars{" "}
        <InlineMath math="a_1, a_2, \dots, a_n \in \mathbb{F}_p" /> and points{" "}
        <InlineMath math="P_1, P_2, \dots, P_n \in \mathbb{G}_1" /> compute{" "}
        <InlineMath math="\sum_i a_iP_i" />
      </>
    ),
  },
  msm_G2: {
    label: (
      <>
        MSM on <InlineMath math="\mathbb{G}_2" />
      </>
    ),
    value: "msm_G2",
    description: (
      <>
        Multiscalar multiplication(s) over <InlineMath math="\mathbb{G}_2" />
      </>
    ),
    tooltip_width: 500,
    tooltip: (
      <>
        Given scalars{" "}
        <InlineMath math="a_1, a_2, \dots, a_n \in \mathbb{F}_p" /> and points{" "}
        <InlineMath math="P_1, P_2, \dots, P_n \in \mathbb{G}_2" /> compute{" "}
        <InlineMath math="\sum_i a_iP_i" />
      </>
    ),
  },
  pairing: {
    label: "Pairing",
    value: "pairing",
    description: "Pairing(s)",
    tooltip_width: 200,
    tooltip: (
      <>
        Computation of <InlineMath>n</InlineMath> pairings
      </>
    ),
  },
  pairing_product: {
    label: "Pairing product",
    description: "Pairing product",
    tooltip_width: 500,
    tooltip: (
      <>
        Given as input{" "}
        <InlineMath math="A_1, A_2, \dots, A_n \in \mathbb{G}_1" /> and{" "}
        <InlineMath math="B_1, B_2, \dots, B_n \in \mathbb{G}_2" />, compute:
        <BlockMath math="\sum_i e(A_i, B_i)" />
      </>
    ),
  },
  add_ff: {
    label: (
      <>
        Addition over <InlineMath math="\mathbb{F}_p" />
      </>
    ),
    description: (
      <>
        Field addition(s) over <InlineMath math="\mathbb{F}_p" />
      </>
    ),
    tooltip_width: 300,
    tooltip: (
      <>
        Given field elements{" "}
        <InlineMath math="a_1, a_2, \dots, a_n \in \mathbb{F}_p" /> compute{" "}
        <InlineMath math="\sum_i a_i" />
      </>
    ),
  },
  mul_ff: {
    label: (
      <>
        Multiplication over <InlineMath math="\mathbb{F}_p" />
      </>
    ),
    description: (
      <>
        Field multiplication(s) over <InlineMath math="\mathbb{F}_p" />
      </>
    ),
    tooltip_width: 300,
    tooltip: (
      <>
        Given field elements{" "}
        <InlineMath math="a_1, a_2, \dots, a_n \in \mathbb{F}_p" /> compute{" "}
        <InlineMath math="\prod_i a_i" />
      </>
    ),
  },
  mul_ec: {
    label: (
      <>
        Scalar mult. over <InlineMath math="\mathbb{G}_1" />
      </>
    ),
    description: (
      <>
        Scalar multiplication(s) over <InlineMath math="\mathbb{G}_1" />
      </>
    ),
    tooltip_width: 300,
    tooltip: (
      <>
        Given <InlineMath math="a_1, a_2, \dots, a_n \in \mathbb{F}_p" /> and{" "}
        <InlineMath math="P_1, P_2, \dots, P_n \in \mathbb{G}_1" /> compute{" "}
        <InlineMath math="a_1 P_1, a_2 P_2, \dots, a_n P_n" />
      </>
    ),
  },
  invert: {
    label: (
      <>
        Inversion over <InlineMath math="\mathbb{F}_p" />
      </>
    ),
    value: "invert",
    description: (
      <>
        Field inversion(s) over <InlineMath math="\mathbb{F}_p" />
      </>
    ),
    tooltip_width: 300,
    tooltip: (
      <>
        Given field elements{" "}
        <InlineMath math="a_1, a_2, \dots, a_n \in \mathbb{F}_p" /> compute{" "}
        <InlineMath math="a_1^{-1}, a_2^{-1}, \dots, a_n^{-1}" />
        <br />
        <Text italic> without batch inversion formulae</Text>
      </>
    ),
  },
  add_ec: {
    label: (
      <>
        Addition over <InlineMath math="\mathbb{G}_1" />
      </>
    ),
    description: (
      <>
        Elliptic curve <InlineMath math="\mathbb{G}_1" /> additions
      </>
    ),
    tooltip_width: 500,
    tooltip: (
      <InlineMath math="\mathbb{G}_1^n \mapsto \mathbb{G}_1: (A_1, A_1, \dots, A_n) \mapsto \sum_i A_i" />
    ),
  },
};

/// these should be automatically generated from the above constants.

const libraries_selection = Object.keys(libraries).map((lib) => {
  return {
    label: libraries[lib].label,
    key: lib,
    disabled: libraries[lib].disabled || false,
  };
});

const machines_selection = Object.keys(machines).map((machine) => {
  return {
    label: machines[machine].label,
    key: machine,
    disabled: machines[machine].disabled || false,
  };
});

const curves_selection = {
  arkworks: [curves.bls12_381],
  blstrs: [curves.bls12_381],
};

const operations_selection = Object.keys(operations).map((operation) => {
  return {
    label: operations[operation].label,
    value: operation,
  };
});

const katexSettings = {
  delimiters: [
    { left: "$$", right: "$$", display: true },
    { left: "$", right: "$", display: false },
  ],
};

const Home = () => {
  let ingredientsList = React.useRef(null);

  // useEffect(() => {
  //   renderMathInElement(ingredientsList.current, katex_settings);
  // });
  const [ingredientForm] = Form.useForm();
  const [recipe, setRecipe] = React.useState([]);
  const [lib, setLib] = React.useState("arkworks");
  const [machine, setMachine] = React.useState("m1pro");
  const [curve, setCurve] = React.useState("bls12_381");
  const [humanTimeFormat, setHumanTimeFormat] = React.useState(true);

  const addIngredient = (ingredient) => {
    // by now we assume the formula can be parsed and has been already validated.
    const op = ingredient.op;
    const formula = parse(ingredient.quantity);
    const item = { op: op, quantity: formula };
    // XXX. when using renderMathInElelement,
    // changing this to [item, ... recipe] will conflict with katex, which will
    // cache some of the rendering and thus fuck up our quantities
    setRecipe((recipe) => [item, ...recipe]);
  };

  const humanTime = (nanoseconds) => {
    const units = ["ns", "μs", "ms", "s", "min", "hr", "day"];
    const conversions = [1, 1000, 1000, 1000, 60, 60, 24];

    let value = Number(nanoseconds);
    let unitIndex = 0;
    let remainder = 0;
    while (value >= conversions[unitIndex] && unitIndex < conversions.length) {
      remainder = value % conversions[unitIndex];
      value = Math.floor(value / conversions[unitIndex]);
      unitIndex += 1;
    }

    if (remainder !== 0) {
      return `${value.toFixed(1)} ${units[unitIndex - 1]} ${remainder.toFixed(
        2
      )} ${units[unitIndex - 2]}`;
    } else {
      return `${value.toFixed(1)} ${units[unitIndex]}`;
    }
  };

  const siTime = (num) => {
    if (num !== 0) {
      const exponent = Math.floor(Math.log10(num));
      const float = num / Math.pow(10, exponent);
      const decimals = Number(float.toFixed(3));

      // time is expressed in nanoseconds, change this to seconds
      return `${decimals}e${exponent - 9} s`;
    } else {
      return "0s";
    }
  };

  const formatTime = (num) => {
    if (humanTimeFormat) {
      return humanTime(num);
    } else {
      return siTime(num);
    }
  };

  const estimatedTime = (item) => {
    if (item.op in estimates[lib][curve][machine]) {
      // XXX bad evaluate
      const samples = estimates[lib][curve][machine][item.op];
      return estimator(samples, item.quantity.evaluate());
    } else {
      return null;
    }
  };

  const estimatedTimeForRecipe = (recipe) => {
    const estimated_time = recipe
      .map(estimatedTime)
      .filter((x) => x !== null)
      .reduce((a, b) => a + b, 0);
    return formatTime(estimated_time);
  };

  const resetRecipe = () => {
    ingredientForm.resetFields();
    setRecipe([]);
  };

  const removeIngredient = (index) => {
    setRecipe(recipe.filter((_, i) => index !== i));
  };

  const handleLibChange = (e) => {
    // UX choice: make it easy to see differences between implementations
    // resetRecipe();
    const lib = e.target.value;
    if (lib in estimates) {
      setLib(e.target.value);
    } else {
      console.error("library not found in estimates");
    }
  };

  const validateQuantity = async (rule, value) => {
    if (value.trim() === "") {
      throw new Error("Missing quantity");
    } else {
      const evaluated = parse(value).evaluate();
      if (evaluated instanceof ResultSet) {
        throw new Error("Only single expressions are supported");
      }
    }
  };

  const BackendSelection = () => {
    return (
      <>
        Estimating &nbsp;
        <Dropdown
          menu={{
            items: curves_selection[lib],
            onClick: ({ key }) => setCurve(key),
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
              items: libraries_selection,
              onClick: ({ key }) => setLib(key),
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
          title={`${machines[machine].description}`}
          overlayInnerStyle={{
            width: machines[machine].tooltip_width,
          }}
        >
          <Dropdown
            menu={{
              items: machines_selection,
              onClick: ({ key }) => setMachine(key),
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
    <Layout>
      <Row align="center">
        <Text align="center" fontSize={20} color="#999">
          <BackendSelection />
        </Text>
      </Row>
      <br />
      <br />
      <Form
        form={ingredientForm}
        onFinish={addIngredient}
        align="center"
        autoComplete="off"
      >
        <Space align="baseline">
          <Form.Item
            name="op"
            initialValue="msm_G1"
            rules={[{ required: true, message: "Missing operation" }]}
          >
            <Select
              style={{ width: 230 }}
              bordered={false}
              placeholder="Operation (e.g. add)"
              showSearch
              options={operations_selection}
            />
          </Form.Item>
          <Form.Item
            name="quantity"
            style={{ width: 110 }}
            rules={[{ validator: validateQuantity }]}
          >
            <Input placeholder="Quantity (e.g. 2^8+1)" />
          </Form.Item>
          <Form.Item>
            <Button
              type="dashed"
              size="medium"
              htmlType="submit"
              icon={<PlusOutlined />}
            ></Button>
          </Form.Item>
        </Space>
      </Form>
      <Row align="center" span={24}>
        <Col span={8} offset={4}>
          <Typography.Paragraph align="right">
            <Text strong>Total time:&nbsp;&nbsp;</Text>
            <Text italic onClick={() => setHumanTimeFormat(!humanTimeFormat)}>
              {estimatedTimeForRecipe(recipe)}
            </Text>
          </Typography.Paragraph>
        </Col>
      </Row>
      <Row justify="center" ref={ingredientsList}>
        <Recipe
          recipe={recipe}
          removeIngredient={removeIngredient}
          operations={operations}
          estimatedTime={estimatedTime}
          formatTime={formatTime}
        />
      </Row>
    </Layout>
  );
};

export default Home;
