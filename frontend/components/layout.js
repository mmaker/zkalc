import React from "react";
import { Footer } from "./footer";
import { Header } from "./header";
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
      <antd.Layout.Content id="content">
        <Header />

        {children}

        <Footer />
      </antd.Layout.Content>
    </antd.Layout>
  );
};
