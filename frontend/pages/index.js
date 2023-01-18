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

import { Layout } from "../components/layout";
import { Recipe } from "../components/recipe";
import { estimator, estimates } from "../lib/estimates";
import { humanTime, siTime } from "../lib/time";
import {
  operations,
  operations_selection,
  machines_selection,
  libraries_selection,
  curves_selection,
} from "../lib/selections";
// import renderMathInElement from "katex/contrib/auto-render";

import curves from "../data/curves.json";
import libraries from "../data/libraries.json";
import machines from "../data/machines.json";

const { Title, Text } = Typography;


const katexSettings = {
  delimiters: [
    { left: "$$", right: "$$", display: true },
    { left: "$", right: "$", display: false },
  ],
};

const Home = () => {
  let ingredientsList = React.useRef(null);

  useEffect(() => {
    //   document.getElementById("title").setAttribute('onClick', "resetRecipe");
    //   renderMathInElement(ingredientsList.current, katex_settings);
    ingredientForm.getFieldInstance("op").focus();
    window.estimator = estimator;
    window.estimates = estimates;
  });
  const [ingredientForm] = Form.useForm();
  const [recipe, setRecipe] = React.useState([]);

  const [cfg, setCfg] = React.useState({lib: "arkworks", machine: "ec2c59xlarge", curve: "bls12_381"});

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
    ingredientForm.getFieldInstance("op").focus();
  };

  const formatTime = (num) => {
    if (humanTimeFormat) {
      return humanTime(num);
    } else {
      return siTime(num);
    }
  };

  const estimatedTime = (item) => {
    return estimator(cfg.curve, cfg.lib, cfg.machine, item.op)(item.quantity.evaluate());
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
      new_machine = machines_selection[new_curve][new_lib].filter(x => !x.disabled)[0].key;
    }

    setCfg({curve: new_curve, lib: new_lib, machine: new_machine});
  };

  const handleCurveChange = (new_curve) => {

    let new_lib = cfg.lib;
    let new_machine = cfg.machine;

    if (!(new_lib in estimates[new_curve])) {
      new_lib = libraries_selection[new_curve].filter(x => !x.disabled)[0].key;
    }

    if (!(new_machine in estimates[new_curve][new_lib])) {
      new_machine = machines_selection[new_curve][new_lib].filter(x => !x.disabled)[0].key;
    }

    setCfg({curve: new_curve, lib: new_lib, machine: new_machine});
  }

  const handleMachineChange = (new_machine) => {
    setCfg({curve: cfg.curve, lib: cfg.lib, machine: new_machine});
  }

  const validateQuantity = async (rule, value) => {
    if (value.trim() === "") {
      throw new Error("Missing quantity");
    } else {
      const evaluated = parse(value).evaluate();
      if (evaluated instanceof ResultSet) {
        throw new Error("Only single expressions are supported");
      } else if (evaluated > Math.pow(2, 40)) {
        throw new Error("Digit too large");
      } else if (evaluated < 0) {
        throw new Error("Digit is negative");
      } else if (isNaN(evaluated)) {
        throw new Error("Not a number");
      } else if (evaluated == 0) {
        throw new Error("Quantity is zero");
      }
    }
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
          overlayInnerStyle={{
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
    <Layout onClickTitle={resetRecipe}>
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
            style={{ width: 140 }}
            rules={[{ validator: validateQuantity }]}
          >
            <Input placeholder="2^64 + log2(100)" />
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
