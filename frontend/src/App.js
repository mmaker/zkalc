import "katex/dist/katex.min.css";

// import also { useState } if willing to monitor changes to the whole page.
import React from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Layout,
  Radio,
  Form,
  Typography,
  Row,
  Col,
  Select,
  Space,
  Input,
  List,
  ConfigProvider,
} from "antd";
import { InlineMath, BlockMath } from "react-katex";
import { parse } from "mathjs";

const { Title, Text } = Typography;

const libs = [
  { label: "arkworks", value: "arkworks", version: "XXX", url: "XXX" },
  { label: "blstrs", value: "blstrs", version: "XXX", url: "XXX" },
  { label: "dalek", value: "dalek", disabled: true },
];

const operations = [
  {
    label: "msm g1",
    value: "msm_g1",
    description: "Multiscalar Multiplication over GG1",
  },
  {
    label: "msm g2",
    value: "msm_g2",
    description: "Multiscalar Multiplication over GG2",
  },
  {
    label: "pairing",
    value: "pair",
    description: "pairing",
  },
  {
    label: "pairing prod",
    value: "pairp",
    description: "pairing product",
  },
  {
    label: "add",
    value: "add",
    description: "addition",
  },
  {
    label: "mul",
    value: "mul",
    description: "multiplication",
  },
  {
    label: "inv",
    value: "inv",
    description: "inversion",
  },
];
// put this into another file, then do:
// import estimates from "./estimates.json";

const estimates = {
  arkworks: {
    mul: (n) => 0 + n * 16,
    add: (n) => 0 + n * 3,
    msm_g1: (n) => 1408808775 + n * 1402994428,
    msm_g2: (n) => 3966014038 + n * 3933109721,
    inv: (n) => 0 + n * 1830,
    pair: (n) => 0 + n * 934521,
    pairp: (n) => 68111100 + n * 64874073,
  },
  blstrs: {
    mul: (n) => 0 + n * 13,
    add: (n) => 0 + n * 3,
    msm_g1: (n) => 888851704 + n * 881313172,
    msm_g2: (n) => 2284591191 + n * 2258823730,
    inv: (n) => 0 + n * 1443,
    pair: (n) => 0 + n * 499450,
    pairp: (n) => 79676490 + n * 76863498,
  },
};

function App() {
  const [form] = Form.useForm();
  const [recipe, setRecipe] = React.useState([]);
  const [lib, setLib] = React.useState("");

  const addIngredient = (ingredient) => {
    const op = ingredient.op;
    const formula = parse(ingredient.quantity);
    const item = { op: op, quantity: formula };
    setRecipe((recipe) => [...recipe, item]);
  };

  const humanTime = (nanoseconds) => {
    const units = ["ns", "us", "ms", "s", "min", "hr", "day"];
    const conversions = [1, 1000, 1000, 1000, 60, 60, 24];

    let value = Number(nanoseconds);
    let unitIndex = 0;
    let remainder = 0;
    while (
      value >= conversions[unitIndex] &&
      unitIndex < conversions.length
    ) {
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
        var f = estimates[lib][item.op];
        return f(item.quantity.evaluate());
      })
      .reduce((a, b) => a + b, 0);
    return humanTime(estimated_time);
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

  return (
    <Layout style={{ height: "100vh" }}>
      <Layout.Content>
        <Title align="center" italic fontSize={100} letterSpacing={-3}>
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
              onChange={(e) => setLib(e.target.value)}
              optionType="button"
              options={libs}
            />
          </Form.Item>
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
              rules={[{ required: true, message: "Missing quantity" }]}
            >
              <Input placeholder="2^64 + 100" />
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
          <Col align="center" span={8} offset={10}>
            <Typography.Paragraph align="right">
              <Text strong>Total time:&nbsp;&nbsp;</Text>
              <Text italic>{estimatedTime(recipe)}</Text>
            </Typography.Paragraph>
          </Col>
        </Row>
        <Row
          justify="center"
          style={{ maxHeight: "600px", overflowY: "scroll" }}
        >
          <List
            dataSource={recipe}
            renderItem={(ingredient, index) => (
              <List.Item key={index}>
                <Col span={20}>
                  <InlineMath>{renderFormula(ingredient.quantity)}</InlineMath>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  {ingredient.op}
                </Col>
                <Col span={20}>{estimatedTime([ingredient])}</Col>
                <Col span={10}>
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
        Developed by Michele Orrù and George Kadianakis.
      </Layout.Footer>
    </Layout>
  );
}

export default App;
