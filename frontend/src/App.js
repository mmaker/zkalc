import React, {useState} from "react"
import { Button, Typography, Form, Input, Select } from "antd"

import coefficients from "./coefficients.json"

const { Title } = Typography;


function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <Form>
      <Form.Item label="Operation">
        <Select onChange={(value)=>{console.log(value)}}>
          {[1, 2, 3].map((key)=>
          <Select.Option key={key} value={coefficients[key]}>{key}</Select.Option>
          )}
        </Select>
      </Form.Item>
      </Form>
    </div>
  );
}

export default App;
