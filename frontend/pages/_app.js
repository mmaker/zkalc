import "../styles/globals.css";
import "antd/dist/reset.css";
import "antd/dist/antd.min.js";
import NextNProgress from 'nextjs-progressbar';

import "highlight.js/styles/github.css";


export default function App({ Component, pageProps }) {
  return (
    <>
      <NextNProgress />
      <Component {...pageProps} />
    </>
  );
}
