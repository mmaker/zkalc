import "../styles/globals.css";
import "antd/dist/reset.css";

export default function App({ Component, pageProps }) {
  return (
    <div className="app">
      <Component {...pageProps} />
    </div>
  );
}
