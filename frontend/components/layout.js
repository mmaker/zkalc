import React from "react";
import { Footer } from "./footer";
import logo from "../public/logo.png";

import Link from "next/link";
import Image from "next/image";
import {
  MinusCircleOutlined,
  PlusOutlined,
  DownOutlined,
  QuestionCircleOutlined,
  ExperimentOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import * as antd from "antd";

const { Row, Col, Tooltip, Typography } = antd;
const { Title } = Typography;

export const Layout = ({ children }) => {
  return (
    <antd.Layout style={{ minHeight: "100vh" }}>
      <br />
      <antd.Layout.Content id="content">
        <Row align="center" span={24}>
          <Col span={2}>
            <Link href="/about">
              <Image src={logo} width={50} alt="" />
            </Link>
          </Col>
          <Col span={10} offset={4}>
            <Link href="/">
              <Title align="center" italic>
                zkalc
              </Title>
            </Link>
          </Col>
          <Col span={3} offset={3}>
            <Link href="/about">
              <Tooltip title="about zkalc">
                <QuestionCircleOutlined
                  style={{ fontSize: "25px", color: "black" }}
                />
              </Tooltip>
            </Link>
            &nbsp;&nbsp;&nbsp;
            <Link href="/methodology">
              <Tooltip title="zkalc scientific methodology">
                <ExperimentOutlined
                  style={{ fontSize: "25px", color: "black" }}
                />
              </Tooltip>
            </Link>
            &nbsp;&nbsp;&nbsp;
            <Link href="https://github.com/asn-d6/zkalc">
              <Tooltip title="zkalc github">
                <GithubOutlined style={{ fontSize: "25px", color: "black" }} />
              </Tooltip>
            </Link>
          </Col>
        </Row>

        {children}

        <Footer />
      </antd.Layout.Content>
    </antd.Layout>
  );
};
