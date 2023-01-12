import { useEffect, useState } from "react";
import hljs from "highlight.js";

//   https://github.com/asn-d6/zkalc/blob/main/backend/arkworks/benches/bench_arkworks.rs#L24-L31
//   https://raw.githubusercontent.com/asn-d6/zkalc/main/backend/arkworks/benches/bench_arkworks.rs

export const GitHubFile = ({ url }) => {
  const rawFileURL = url
    .replace("github.com", "raw.githubusercontent.com")
    .replace("/blob", "");

  let lines = null;

  if (url.includes("#")) {
    lines = url
      .split("#")[1]
      .split("-")
      .map((x) => parseInt(x.replace("L", "")));
  }

  const [code, setCode] = useState(null);

  useEffect(() => {
    fetch(rawFileURL).then((response) => {
      response.text().then((text) => {
        // only use lines above if set

        let code = text;

        if (lines != null) {
          code = text
            .split("\n")
            .slice(lines[0] - 1, lines[1])
            .join("\n");
        }

        setCode(code);
      });
    });
  }, [rawFileURL, lines]);

  useEffect(() => {
    hljs.highlightAll();
  }, [code]);

  if (code === null) {
    return (
      <div className="emgithub-container">
        <div className="lds-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="emgithub-container">
      <div className="emgithub-file emgithub-file-light">
        <div className="file-data">
          <div className="code-area">
            <pre>
              <code className="rs">{code}</code>
            </pre>
          </div>
        </div>
        <div className="file-meta file-meta-light">
          <a target="_blank" href={rawFileURL} rel="noreferrer">
            view raw
          </a>
          <a target="_blank" href={url} rel="noreferrer">
            {url}
          </a>
        </div>
      </div>
    </div>
  );
};
