import React from "react";

const logo = () => {
  const imageUrl =
    "https://i.imgur.com/QKxqUR6.png"; // URL of the webp image

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "200px",
    height: "150px",
  };

  const imageStyle = {
    maxWidth: "100%",
    maxHeight: "100%",
  };

  return (
    <div style={containerStyle}>
      <img src={imageUrl} style={imageStyle} />
    </div>
  );
};

export default logo;
