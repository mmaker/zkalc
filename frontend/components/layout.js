import React from "react";
import { Footer } from "./footer";
import { Header } from "./header";
import * as antd from "antd";

const { Row, Col, Tooltip, Typography } = antd;
const { Title } = Typography;

export const Layout = (kwargs) => {
  let onClickTitle = kwargs.onClickTitle || (()=>{window.location.href = '/'});
  let children = kwargs.children;
  let title = kwargs.title || "zkalc";
  return (
    <antd.Layout style={{ minHeight: "100vh" }}>
      <antd.Layout.Content id="content">
        <Header onClickTitle={onClickTitle} title={title}/>
        {children}
        <Footer />
      </antd.Layout.Content>
    </antd.Layout>
  );
};
