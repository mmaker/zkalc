// import also { useState } if willing to monitor changes to the whole page.
import React from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { AutoComplete, Button, Radio, Form, Typography, InputNumber, Select, Space, Layout, Input } from "antd";
import { Content } from "antd/es/layout/layout";


const { Title } = Typography;
const { Option } = Select;

const libs = [
  { label: "arkworks", value: "arkworks", },
  { label: "blstrs", value: "blstrs"},
  { label: "dalek", value: "dalek", disabled: true}
];

// put this into another file, then do:
// import estimates from "./estimates.json";

const estimates = {
  arkworks: [
    {key: "msm", value: "msm"},
    {key: "add", value: "add"},
  ],
  blstrs: [
    {key: "msm", value: "msm"},
    {key: "add", value: "add"},
  ]
};

function App() {
  const [form] = Form.useForm();
  const [estimated_time, setTotal] = React.useState(0);

  const onFormChange = (values) => {
    const recipe = form.getFieldsValue();
    console.log();
    setTotal(estimated_time + 1);
  };

  const resetRecipe = () => {
    form.setFieldsValue({ recipe: [] });
  };

  return (
    <>
      <Title align="center">zkalc</Title>
      <Form
        style={{ padding: '0 50px', margin: '16x 0' }}
        form={form}
        onChange={onFormChange}
        autoComplete="off"
      >
        <Form.Item
                  name="lib"
                  label="Framework"
                  rules={[{ required: true, message: "Missing lib" }]}>
          <Radio.Group onChange={resetRecipe} optionType="button" options={libs}/>
        </Form.Item>
        <Form.List name="recipe">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
              <Space key={field.key} align="baseline">
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
                        rules={[{ required: true, message: "Missing operation" }]}
                      >
                        <Select
                          disabled={!form.getFieldValue("lib")}
                          style={{ width: 230 }}
                          bordered={false}
                          showSearch
                          options={estimates[form.getFieldValue("lib")]}
                        />
                      </Form.Item>
                    )}
                  </Form.Item>
                  <Form.Item
                    {...field}
                    name={[field.name, "quantity"]}
                    rules={[{ required: true, message: "Missing quantity" }]}
                  >
                    <InputNumber min={1} max={100} style={{ width: 100 }}/>
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
      <p>Total time: {estimated_time} </p>
    </>
  );
}

export default App;
