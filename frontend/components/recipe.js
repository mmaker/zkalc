import { List, Col, Tooltip } from "antd";
import { formatNumber, formatFormula } from "../lib/formula";

import { InlineMath } from "react-katex";
import { MinusCircleOutlined } from "@ant-design/icons";

export const Recipe = ({
    recipe,
    removeIngredient,
    operations,
    estimatedTime,
}) => {
  return <List
    dataSource={recipe}
    style={{ width: "90vh" }}
    renderItem={(ingredient, index) => {
      return (
        <List.Item key={index}>
          <Col span={14}>
            <InlineMath math={formatFormula(ingredient.quantity)} />
            &nbsp;&nbsp;&nbsp;&nbsp;
            <Tooltip
              placement="top"
              color="#108ee9"
              overlayInnerStyle={{
                width: operations[ingredient.op].tooltip_width,
              }}
              title={operations[ingredient.op].tooltip}
            >
              {operations[ingredient.op].description}
            </Tooltip>
          </Col>
          <Col span={6} align="right">
            {estimatedTime([ingredient])}
          </Col>
          <Col span={1}>
            <MinusCircleOutlined onClick={() => removeIngredient(index)} />
          </Col>
        </List.Item>
      );
    }}
  />;
};
