import "katex/dist/katex.min.css";
import logo from "./zkalc.png";

// import also { useState } if willing to monitor changes to the whole page.
import React from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Layout,
  Radio,
  Form,
  Typography,
  Row,
  Col,
  Select,
  Alert,
  Space,
  Tooltip,
  Input,
  List,
} from "antd";
import { InlineMath } from "react-katex";
import { parse } from "mathjs";

///////////////////// Add your benchmarks here /////////////////////

// Import our benchmark results
import estimates_blstrs from "./results_blstrs.json";
import estimates_arkworks from "./results_arkworks.json";

const estimates = {
  blstrs: estimates_blstrs,
  arkworks: estimates_arkworks,
};

const { Title, Text } = Typography;

const libs = [
  { label: "arkworks", value: "arkworks", version: "XXX", url: "XXX" },
  { label: "blstrs", value: "blstrs", version: "XXX", url: "XXX" },
  { label: "dalek", value: "dalek", disabled: true },
];

const operations = [
  {
    label: "G1 MSM",
    value: "msm_G1",
    description: "Multiscalar multiplication over G1",
    tooltip: "A linear combination of points and scalars in the G1 group",
  },
  {
    label: "G2 MSM",
    value: "msm_G2",
    description: "Multiscalar multiplication over G2",
    tooltip: "A linear combination of points and scalars in the G2 group",
  },
  {
    label: "Pairing",
    value: "pairing",
    description: "Pairing(s)",
    tooltip: "Computation of n pairings",
  },
  {
    label: "Pairing product",
    value: "pairing_product",
    description: "Pairing product",
    tooltip: "A product of n pairings",
  },
  {
    label: "Field Addition",
    value: "add_ff",
    description: "Field addition(s)",
    tooltip: "Addition of n elements on the field",
  },
  {
    label: "Field Multiplication",
    value: "mul",
    description: "Field multiplication(s)",
    tooltip: "Multiplication of n elements on the field",
  },
  {
    label: "Field Inversion",
    value: "invert",
    description: "Field inversion(s)",
    tooltip: "Inversion of n elements on the field",
  },
  {
    label: "Curve Addition",
    value: "add_ec",
    description: "Elliptic curve G1 additions",
    tooltip: "Addition of two elements in the G1 group",
  },
];

function App() {
  const [form] = Form.useForm();
  const [recipe, setRecipe] = React.useState([]);
  const [lib, setLib] = React.useState("");
  const [humanTimeFormat, setHumanTimeFormat] = React.useState(true);

  const addIngredient = (ingredient) => {
      // by now we assume the formula can be parsed and has been already validated.
      const op = ingredient.op;
      const formula = parse(ingredient.quantity);
      const item = { op: op, quantity: formula };
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

      // time is expressed in seconds, change this to seconds
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

  const formatNumber = (num) => {
    if (num >= 1e10) {
      const float = num / Math.pow(10, Math.floor(Math.log10(num)));
      const decimals = Number(float.toFixed(2));
      const exponent = Math.floor(Math.log10(num));
      return `${decimals} \\cdot 10^{${exponent}}`;
    } else if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)} \\cdot 10^9`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}\\cdot 10^6`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}\\cdot 10^3`;
    } else {
      return `${Number(num.toFixed(2))}`;
    }
  };

  const estimatedTime = (recipe) => {
    const estimated_time = recipe
      .map((item) => {
        if (item.op in estimates[lib]) {
          var f = new Function(
            estimates[lib][item.op].arguments,
            estimates[lib][item.op].body
          );
          // XXX bad evaluate
          return f(item.quantity.evaluate());
        } else {
          return 0;
        }
      })
      .reduce((a, b) => a + b, 0);
    return formatTime(estimated_time);
  };

  const resetRecipe = () => {
    setRecipe([]);
  };

  const removeIngredient = (index) => {
    setRecipe(recipe.filter((_, i) => index !== i));
  };

  const renderFormula = (formula) => {
    const evaluation = formatNumber(formula.evaluate());
    // if the expression is simple, just return it.
    if (evaluation === formula.toTex()) {
      return formula.toTex();
      // else, round up to the closest integer
    } else {
      return formula.toTex() + "\\approx" + evaluation;
    }
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

  const printAuthors = () => {
    const authors = ["George Kadianakis", "Michele Orrù"];
    authors.sort(() => Math.random() - 0.5);
    return `Developed by ${authors[0]} and ${authors[1]}.`;
  };

  const validateQuantity = async (rule, value) => {
    if (value.trim() === '') {
      throw new Error('Missing quantity');
    } else {
      parse(value).evaluate()
    }
  };

  const userGuide = () => {
    return (
      <>
        - Basic usage: Choose a backend. Then choose an operation and its size. Press the button! <br />
        - Choosing a different backend refreshes all results <br />
        - All benchmarks were run with multithreading enabled on the respective platform <br />
        - Results above 2^21 have reduced accuracy due to missing benchmarks (See TODO.md) <br />
        - Click on the total time to get the result in SI units (seconds) <br />
        - For more details see the "Help" page!
      </>
    );
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Layout.Content>
        <Title
          align="center"
          italic
          fontSize={100}
          letterSpacing={-3}
          onClick={() => {
            resetRecipe();
            form.resetFields();
          }}
        >
          zkalc
        </Title>
        <Form
          align="center"
          style={{ padding: "0 50px", margin: "16x 0" }}
          form={form}
          onFinish={addIngredient}
          autoComplete="off"
        >
          <Form.Item
            name="lib"
            rules={[{ required: true, message: "Missing lib" }]}
          >
            <Radio.Group
              onChange={(e) => handleLibChange(e)}
              optionType="button"
              options={libs}
            />
          </Form.Item>
          <Col span={8} offset={16}>
            <Space direction="vertical" style={{ width: '90%' }}>
              <Alert
                description={userGuide()}
                type="info"
              />
            </Space>
          </Col>
          <Space align="baseline">
            <Form.Item
              name="op"
              rules={[{ required: true, message: "Missing operation" }]}
            >
              <Select
                style={{ width: 150 }}
                bordered={false}
                placeholder="pk ops"
                showSearch
                options={operations}
              />
            </Form.Item>
            <Form.Item
              name="quantity"
              rules={[{ validator: validateQuantity }]}
            >
              <Input placeholder="Quantity (e.g. 2^8+1)" />
            </Form.Item>
            <Form.Item>
              <Button
                type="dashed"
                disabled={!form.getFieldValue("lib")}
                size="medium"
                htmlType="submit"
                icon={<PlusOutlined />}
              ></Button>
            </Form.Item>
          </Space>
        </Form>
        <Row justify="center">
          <Col align="center" span={8} offset={6}>
            <Typography.Paragraph align="right">
              <Text strong>Total time:&nbsp;&nbsp;</Text>
              <Text italic onClick={() => setHumanTimeFormat(!humanTimeFormat)}>
                {estimatedTime(recipe)}
              </Text>
            </Typography.Paragraph>
          </Col>
        </Row>
        <Row justify="center">
          <List
            dataSource={recipe}
            style={{ maxHeight: "66.6vh", width: "90vh", overflowY: "scroll" }}
            renderItem={(ingredient, index) => (
              <List.Item key={index}>
                <Col span={10}>
                  <InlineMath>{renderFormula(ingredient.quantity)}</InlineMath>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <Tooltip title={operations.filter((x) => x.value === ingredient.op)[0].tooltip}>
                  {operations.filter((x) => x.value === ingredient.op)[0].description}
                  </Tooltip>
                </Col>
                <Col span={10} align="right">
                  {estimatedTime([ingredient])}
                </Col>
                <Col span={1}>
                  <MinusCircleOutlined
                    onClick={() => removeIngredient(index)}
                  />
                </Col>
              </List.Item>
            )}
          />
        </Row>
      </Layout.Content>
      <Layout.Footer align="center">
        <img src={logo} width={50} />
        <br />
        {printAuthors()}
      </Layout.Footer>
    </Layout>
  );
}

export default App;
