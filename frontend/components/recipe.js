import { List, Col, Tooltip, Table } from "antd";
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
          styles={{
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
  estimatedTimeAllLibraries,
  formatTime,
  compareMode,
  availableLibraries,
  primaryLibrary,
}) => {
  if (compareMode && availableLibraries?.length > 0) {
    const columns = [
      {
        title: "Operation",
        dataIndex: "operation",
        key: "operation",
        width: 250,
      },
      ...availableLibraries.map((lib) => ({
        title: lib.label,
        dataIndex: lib.key,
        key: lib.key,
        align: "right",
        render: (time) => (time !== null ? formatTime(time) : "N/A"),
      })),
      {
        title: "",
        key: "remove",
        width: 40,
        render: (_, record) => (
          <MinusCircleOutlined onClick={() => removeIngredient(record.index)} />
        ),
      },
    ];

    const dataSource = recipe.map((ingredient, index) => {
      const times = estimatedTimeAllLibraries(ingredient);
      return {
        key: index,
        index: index,
        operation: (
          <Tooltip title={operations[ingredient.op].tooltip}>
            <InlineMath math={formatFormula(ingredient.quantity)} />
            &nbsp;&nbsp;{operations[ingredient.op].description}
          </Tooltip>
        ),
        ...times,
      };
    });

    const totals = {};
    availableLibraries.forEach((lib) => {
      totals[lib.key] = dataSource
        .map((row) => row[lib.key])
        .filter((x) => x !== null)
        .reduce((a, b) => a + b, 0);
    });

    const dataWithTotal = [
      {
        key: "total",
        index: -1,
        operation: <strong>Total</strong>,
        ...Object.fromEntries(
          availableLibraries.map((lib) => [lib.key, totals[lib.key]]),
        ),
      },
      ...dataSource,
    ];

    const columnsWithBoldTotal = columns.map((col) => {
      if (col.key === "remove") {
        return {
          ...col,
          render: (_, record) =>
            record.key === "total" ? null : (
              <MinusCircleOutlined
                onClick={() => removeIngredient(record.index)}
              />
            ),
        };
      }
      if (col.dataIndex && col.dataIndex !== "operation") {
        return {
          ...col,
          render: (time, record) =>
            record.key === "total" ? (
              <strong>{time !== null ? formatTime(time) : "N/A"}</strong>
            ) : time !== null ? (
              formatTime(time)
            ) : (
              "N/A"
            ),
        };
      }
      return col;
    });

    return (
      <Table
        columns={columnsWithBoldTotal}
        dataSource={dataWithTotal}
        pagination={false}
        size="small"
        scroll={{ x: "max-content" }}
      />
    );
  }

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
