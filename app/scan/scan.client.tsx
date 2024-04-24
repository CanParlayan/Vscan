import React, { useState } from "react";
import axios from "axios";
import "./style.css";

const startScan = async (
  url: string,
  setIsScanning: React.Dispatch<React.SetStateAction<boolean>>
) => {
  setIsScanning(true);
  try {
    const response = await axios.post("http://localhost:5000/start-scan", {
      url,
    });
    console.log(response.data); // Handle response data

    // Call writeToDatabase with scanData
    await writeToDatabase(response.data);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setIsScanning(false);
  }
};

const writeToDatabase = async (scanData: any) => {
  try {
    const response = await axios.post(
      "http://localhost:5000/write-to-database",
      scanData
    );
    console.log(response.data); // Handle response data
  } catch (error) {
    console.error("Error writing to database:", error);
  }
};

const ClientComponent: React.FC = () => {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  return (
    <div className="scan-container">
      <input
        className="url"
        type="text"
        id="urlInput"
        placeholder="Enter URL"
        value={url}
        onChange={handleInputChange}
      ></input>
      <button
        className="scanbutton"
        onClick={() => startScan(url, setIsScanning)}
        disabled={isScanning}
      >
        {isScanning ? "Scanning..." : "Start Scan"}
      </button>
    </div>
  );
};

export default ClientComponent;
