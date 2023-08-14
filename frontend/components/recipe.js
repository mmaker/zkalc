import { List, Col, Tooltip } from "antd";
import { formatFormula } from "../lib/formula";

import { InlineMath } from "react-katex";
import { MinusCircleOutlined } from "@ant-design/icons";

const RecipeItem = ({
  operations,
  ingredient,
  removeIngredient,
  estimatedTime,
  formatTime,
}) => {
  const operation = operations[ingredient.op];
  const time = estimatedTime(ingredient);

  return (
    <List.Item className={time === null ? "invalid-ingredient" : ""}>
      <Col span={14}>
        <InlineMath math={formatFormula(ingredient.quantity)} />
        &nbsp;&nbsp;&nbsp;&nbsp;
        <Tooltip
          placement="top"
          color="#108ee9"
          overlayInnerStyle={{
            width: operation.tooltip_width,
          }}
          title={operation.tooltip}
        >
          {operation.description}
        </Tooltip>
      </Col>
      <Col span={6} align="right" className="time">
        {time !== null ? formatTime(time) : "unavailable"}
      </Col>
      <Col span={1}>
        <MinusCircleOutlined onClick={removeIngredient} />
      </Col>
    </List.Item>
  );
};

export const Recipe = ({
  recipe,
  removeIngredient,
  operations,
  estimatedTime,
  formatTime,
}) => {
  return (
    <List
      dataSource={recipe}
      style={{ width: "90vh" }}
      renderItem={(ingredient, index) => {
        return (
          <RecipeItem
            key={index}
            ingredient={ingredient}
            operations={operations}
            estimatedTime={estimatedTime}
            formatTime={formatTime}
            removeIngredient={() => removeIngredient(index)}
          />
        );
      }}
    />
  );
};
