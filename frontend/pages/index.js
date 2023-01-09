import React, { useEffect } from "react";

import "katex/dist/katex.min.css";

import Link from "next/link";
import Image from "next/image";
import logo from "../public/logo.png";
import renderMathInElement from "katex/contrib/auto-render";

import {
  MinusCircleOutlined,
  PlusOutlined,
  DownOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Col,
  Form,
  Input,
  Layout,
  List,
  Radio,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
  Dropdown,
} from "antd";

import { parse } from "mathjs";

///////////////////// Add your benchmarks here /////////////////////

// Import our benchmark results
import estimates_arkworks from "../data/results_arkworks.json";
import estimates_blstrs from "../data/results_blstrs.json";

const estimates = {
  blstrs: {
    bls12_381: {
      x86_64: estimates_blstrs,
      m1pro: estimates_blstrs,
    },
  },
  arkworks: {
    bls12_381: {
      x86_64: estimates_arkworks,
      m1pro: estimates_arkworks,
    },
  },
};

const { Title, Text } = Typography;

const libraries = {
  arkworks: {label: "arkworks-rs", version: "0.4", url: "https://arkworks.rs/"},
  blstrs: {label: "blstrs", version: "0.1", url: "blstrs"},
  dalek: {label: "dalek", version: "0.1", url: "dalek", disabled: true},
}

const machines = {
  m1pro: {label: "M1 Pro 2021", desciption: "Macbook Pro 2022 14\" M1 Pro"},
  x86_64: {label: "ThinkPad X1 Carbon", desciption: "ThinkPad X1 Carbon 1970"},
  ec2large3: {label: "ec2-large3", disabled: true},
}

const curves = {
  bls12_381: {label: "BLS12-381", key: "bls12_381"},
}

const libraries_selection = Object.keys(libraries).map((lib) => {
  return {
    label: libraries[lib].label,
    key: lib,
    disabled: libraries[lib].disabled || false,
  };
});

/// these should be automatically generated from the above constants.

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

const operations = [
  {
    label: "G1 MSM",
    value: "msm_G1",
    description: "Multiscalar multiplication(s) over $\\mathbb{G}_1$",
    tooltip:
      "A linear combination of points and scalars in the \\mathbb{G}1 group",
  },
  {
    label: "G2 MSM",
    value: "msm_G2",
    description: "Multiscalar multiplication(s) over $\\mathbb{G}_2$",
    tooltip:
      "A linear combination of points and scalars in the $\\mathbb{G}_2$ group",
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
    tooltip: "A product of $n$ pairings",
  },
  {
    label: "Field Addition",
    value: "add_ff",
    description: "Field addition(s)",
    tooltip: "Addition of $n$ elements on the field",
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

const katex_settings = {
  delimiters: [
    { left: "$$", right: "$$", display: true },
    { left: "$", right: "$", display: false },
  ],
};

const Home = () => {
  let ingredientsList = React.useRef(null);

  useEffect(() => {
    renderMathInElement(ingredientsList.current, katex_settings);
  });
  const [recipe, setRecipe] = React.useState([]);
  const [lib, setLib] = React.useState("arkworks");
  const [machine, setMachine] = React.useState("x86_64");
  const [curve, setCurve] = React.useState("bls12_381");
  const [humanTimeFormat, setHumanTimeFormat] = React.useState(true);

  const addIngredient = (ingredient) => {
    // by now we assume the formula can be parsed and has been already validated.
    const op = ingredient.op;
    const formula = parse(ingredient.quantity);
    const item = { op: op, quantity: formula };
    setRecipe((recipe) => [...recipe, item]);
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
        if (item.op in estimates[lib][curve][machine]) {
          var f = new Function(
            estimates[lib][curve][machine][item.op].arguments,
            estimates[lib][curve][machine][item.op].body
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

  const formatFormula = (formula) => {
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

  function Authors() {
    // only two authors for now
    const _authors = [
      { name: "George Kadianakis", website: "https://github.com/asn-d6" },
      { name: "Michele Orrù", website: "https://tumbolandia.net" },
    ];
    const [authors, setAuthors] = React.useState(_authors);

    // Randomize author list
    useEffect(()=>{
      const randomizedAuthors = [..._authors].sort(() => 0.5 - Math.random());
      setAuthors(randomizedAuthors);
    }, []);

    return (
      <Text>
        Developed by
        <a href={authors[0].website}> {authors[0].name}</a> and{" "}
        <a href={authors[1].website}>{authors[1].name}</a>.
      </Text>
    );
  };

  const validateQuantity = async (rule, value) => {
    if (value.trim() === "") {
      throw new Error("Missing quantity");
    } else {
      parse(value).evaluate();
    }
  };

  const BackendSelection = () => {
    return (
      <>
        Estimating &nbsp;
        <Tooltip placement="top" title={`${libraries[lib].label} v${libraries[lib].version}`}>
        <Dropdown trigger="click" menu={{ items: libraries_selection, onClick: ({ key }) => setLib(key) }}>
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              {libraries[lib].label}
              <DownOutlined style={{ fontSize: "10px", margin: "-10px" }} />
              &nbsp;
            </Space>
          </a>
        </Dropdown>
        </Tooltip>
        over &nbsp;
        <Dropdown
          menu={{
            items: curves_selection[lib],
            onClick: ({ key }) => setCurve(key),
          }}
        >
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              {curve}
              <DownOutlined style={{ fontSize: "10px", margin: "-10px" }} />
              &nbsp;
            </Space>
          </a>
        </Dropdown>
        using &nbsp;
        <Tooltip placement="top" title={`${machines[machine].desciption}`}>
        <Dropdown
        trigger={['click']}
          menu={{ items: machines_selection, onClick: ({ key }) => setMachine(key) }}
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
    <Layout style={{ height: "100vh" }}>
      <Layout.Content>
        <Title align="center" italic onClick={resetRecipe}>
          zkalc
        </Title>
        <Row align="center">
          <Text align="center" fontSize={20} color="#999">
            <BackendSelection />
          </Text>
        </Row>
        <br />
        <br />
        <Form onFinish={addIngredient} align="center" autoComplete="off">
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
                size="medium"
                htmlType="submit"
                icon={<PlusOutlined />}
              ></Button>
            </Form.Item>
          </Space>
        </Form>
        <Row align="center" span={24}>
          <Col span={8} offset={10}>
            <Typography.Paragraph align="right">
              <Text strong>Total time:&nbsp;&nbsp;</Text>
              <Text italic onClick={() => setHumanTimeFormat(!humanTimeFormat)}>
                {estimatedTime(recipe)}
              </Text>
            </Typography.Paragraph>
          </Col>
        </Row>
        <Row justify="center" ref={ingredientsList}>
          <List
            dataSource={recipe}
            style={{ maxHeight: "64vh", width: "90vh", overflowY: "scroll" }}
            renderItem={(ingredient, index) => {
              return (
                <List.Item key={index}>
                  <Col span={14}>
                    ${formatFormula(ingredient.quantity)}$
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <Tooltip
                      title={
                        operations.filter((x) => x.value === ingredient.op)[0]
                          .tooltip
                      }
                    >
                      {
                        operations.filter((x) => x.value === ingredient.op)[0]
                          .description
                      }
                    </Tooltip>
                  </Col>
                  <Col span={6} align="right">
                    {estimatedTime([ingredient])}
                  </Col>
                  <Col span={1}>
                    <MinusCircleOutlined
                      onClick={() => removeIngredient(index)}
                    />
                  </Col>
                </List.Item>
              );
            }}
          />
        </Row>
      </Layout.Content>
      <Layout.Footer align="center">
        <Link href="/about">
          <Image src={logo} width={50} alt="" />
        </Link>
        <br />
        <Authors />
      </Layout.Footer>
    </Layout>
  );
};

export default Home;
