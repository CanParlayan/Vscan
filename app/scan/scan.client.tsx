import React, { useState } from "react";
import axios from "axios";

const ClientComponent: React.FC = () => {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanOutput, setScanOutput] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const startScan = async () => {
    setIsScanning(true);
    try {
      const response = await axios.post("http://localhost:8000/start-scan", {
        url,
      });
      const { stdout, message } = response.data;
      if (stdout) {
        setScanOutput(stdout);
      }
      console.log(message);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="scan-container">
      <input
        type="text"
        className="url"
        id="urlInput"
        placeholder="Enter URL"
        value={url}
        onChange={handleInputChange}
      />
      <button
        className="scanbutton"
        onClick={startScan}
        disabled={isScanning}
      >
        {isScanning ? "Scanning..." : "Start Scan"}
      </button>

      {scanOutput && (
        <div className="output-container">
          <h3>Scan Output:</h3>
          <pre>{scanOutput}</pre>
        </div>
      )}
    </div>
  );
};

export default ClientComponent;
