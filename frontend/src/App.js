import "katex/dist/katex.min.css";

// import also { useState } if willing to monitor changes to the whole page.
import React from "react";
import { Duration } from "luxon";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Radio,
  Form,
  Typography,
  InputNumber,
  Select,
  Space,
  Layout,
  Input,
} from "antd";
import { Content } from "antd/es/layout/layout";
import { InlineMath, BlockMath } from "react-katex";

const { Title } = Typography;
const { Option } = Select;


const libs = [
  { label: "arkworks", value: "arkworks", version: "XXX", url: "XXX" },
  { label: "blstrs", value: "blstrs", version: "XXX", url: "XXX" },
  { label: "dalek", value: "dalek", disabled: true },
];

const operations = [
  {
    label: "msm ff",
    value: "msm_ff",
    description: "Multiscalar Multiplication over FF",
  },
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
    description: "Multiscalar Multiplication over GG2",
  },
  {
    label: "add",
    value: "add",
    description: "Multiscalar Multiplication",
  },
  {
    label: "mul",
    value: "mul",
    description: "Multiscalar Multiplication",
  },
]
// put this into another file, then do:
// import estimates from "./estimates.json";

const estimates = {
  arkworks: {
    msm_g1: {
      coefficients: [164, 1641],
    },
    msm_g2: {
      coefficients: [164, 1641],
    },
    msm_ff: {
      coefficients: [164, 1641],
    },
    msm_gt: {
      coefficients: [164, 1641],
    },
  },
  blstrs: {
    msm_g1: {
      coefficients: [164, 1641],
    },
    msm_g2: {
      coefficients: [164, 1641],
    },
    msm_ff: {
      coefficients: [164, 1641],
    },
    msm_gt: {
      coefficients: [164, 1641],
    },
  },
};

// objects are of the form
// {
//   "lib": "arkworks",
//   "recipe": [
//       {
//           "op": "msm_ff",
//           "quantity": 10
//       },
//       ...
//   ]
// }
function estimatedTime(instructions) {
  return instructions.recipe.map(item => {
    var f = estimates[instructions.lib][item.op].coefficients;
    return f[0] * item.quantity + f[1]
  }).reduce((a, b) => a+b, 0)
}

function App() {
  const [form] = Form.useForm();
  const [estimated_time, setTotal] = React.useState(0);

  const onFormChange = (values) => {
    const recipe = form.getFieldsValue();
    console.log(recipe);
    const estimated_time = estimatedTime(recipe);
    setTotal(estimated_time);
  };

  const resetRecipe = () => {
    form.setFieldsValue({ recipe: [] });
  };

  return (
    <>
      <Title align="center">zkalc</Title>
      <Form
        style={{ padding: "0 50px", margin: "16x 0" }}
        form={form}
        onChange={onFormChange}
        autoComplete="off"
      >
        <Form.Item
          name="lib"
          label="Framework"
          tooltip="Working on versions XXX"
          rules={[{ required: true, message: "Missing lib" }]}
        >
          <Radio.Group
            onChange={resetRecipe}
            optionType="button"
            options={libs}
          />
        </Form.Item>
        <Form.List name="recipe">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Space
                  key={field.key}
                  align="baseline"
                  style={{ display: "flex", marginBottom: 8 }}
                >
                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, curValues) =>
                      prevValues.lib !== curValues.lib ||
                      prevValues.recipe !== curValues.recipe
                    }
                  >
                    {() => (
                      <Form.Item
                        {...field}
                        name={[field.name, "op"]}
                        rules={[
                          { required: true, message: "Missing operation" },
                        ]}
                      >
                        <Select
                          disabled={!form.getFieldValue("lib")}
                          style={{ width: 230 }}
                          bordered={false}
                          showSearch
                          options={operations} // [form.getFieldValue("lib")]}
                        />
                      </Form.Item>
                    )}
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, "quantity"]}
                    rules={[{ required: true, message: "Missing quantity" }]}
                  >
                    <InputNumber min={1} max={100} style={{ width: 100 }} />
                  </Form.Item>
                </Space>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  size="large"
                  icon={<PlusOutlined />}
                >
                  Operation
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
      <p>Total time: {Duration.fromMillis(estimated_time).rescale().toHuman({ unitDisplay: "short" })} </p>
    </>
  );
}

export default App;
