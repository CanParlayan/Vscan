import React from "react";

const logo = () => {
  const imageUrl =
    "https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png"; // URL of the webp image

  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "200px", // Set width and height as needed for the container
    height: "150px",
  };

  const imageStyle = {
    maxWidth: "80%",
    maxHeight: "60%",
  };

  return (
    <div style={containerStyle}>
      <img src={imageUrl} style={imageStyle} />
    </div>
  );
};

export default logo;
