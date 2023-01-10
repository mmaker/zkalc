import React from "react";
import { Typography } from "antd";

const { Title, Text } = Typography;

const Authors = () => {
  // only two authors for now
  const _authors = [
    { name: "George Kadianakis", website: "https://github.com/asn-d6" },
    { name: "Michele Orrù", website: "https://tumbolandia.net" },
  ];
  const [authors, setAuthors] = React.useState(_authors);

  // Randomize author list
  React.useEffect(() => {
    const randomizedAuthors = [..._authors].sort(() => 0.5 - Math.random());
    setAuthors(randomizedAuthors);
  }, []);

  return (
    <Text style={{ fontSize: 13 }}>
      Developed by
      <a href={authors[0].website}> {authors[0].name}</a> and{" "}
      <a href={authors[1].website}>{authors[1].name}</a>.
    </Text>
  );
};

export const Footer = () => {
  return (
    <div id="footer">
      <Authors />
    </div>
  );
};
