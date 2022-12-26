import React, { useState } from "react";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Radio, Form, Typography, Input, Select, Space } from "antd";


const { Title } = Typography;
const { Option } = Select;

const libs = [
  { label: "arkworks", value: "arkworks" },
  { label: "blstrs", value: "blstrs"},
  { label: "dalek", value: "dalek", disabled: true}
];

// put this into another file, then do:
// import estimates from "./estimates.json";

const estimates = {
  arkworks: [
    {key: "msm", "value": "msm"},
    {key: "add", "value": "add"},
  ],
  blstrs: [
    {key: "msm", "value": "msm"},
    {key: "add", "value": "add"},
  ]
};

function App() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Received values of form:", values);
  };

  const resetRecipe = () => {
    form.setFieldsValue({ recipe: [] });
  };

  return (
    <>
      <Title>Zkalc</Title>
      <Form
        form={form}
        name="dynamic_form_complex"
        onFinish={onFinish}
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
                        label="Operation"
                        name={[field.name, "op"]}
                        rules={[{ required: true, message: "Missing operation" }]}
                      >
                        <Select
                          disabled={!form.getFieldValue("lib")}
                          style={{ width: 230 }}
                        >
                          {(estimates[form.getFieldValue("lib")] || []).map(
                            (item) => (
                              <Option key={item["key"]} value={item["value"]}>
                                {item["value"]}
                              </Option>
                            )
                          )}
                        </Select>
                      </Form.Item>
                    )}
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Quantity"
                    name={[field.name, "quantity"]}
                    rules={[{ required: true, message: "Missing quantity" }]}
                  >
                    <Input />
                  </Form.Item>

                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                </Space>
              ))}

              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Add sights
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>

    </>
  );
}

export default App;
