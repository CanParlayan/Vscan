"use client";
import "./style.css";
import { useEffect } from "react";
import axios from "axios";
import Logo from "../components/logo";
import "@fortawesome/fontawesome-free/css/all.min.css";

const ScanPage = () => {
  useEffect(() => {
    const startScan = async () => {
      const urlInput = document.getElementById("urlInput") as HTMLInputElement;
      if (!urlInput) {
        console.error("URL input element not found.");
        return;
      }

      const url = urlInput.value;
      try {
        const response = await axios.post("http://localhost:3000/start-scan", {
          url,
        });
        console.log(response.data); // Handle response data
      } catch (error) {
        console.error("Error:", error);
      }
    };

    // Attach event listener to the button when component mounts
    const startScanButton = document.getElementById("startScanButton");
    if (startScanButton) {
      startScanButton.addEventListener("click", startScan);
    } else {
      console.error("Start Scan button not found.");
    }

    // Cleanup: remove event listener when component unmounts
    return () => {
      if (startScanButton) {
        startScanButton.removeEventListener("click", startScan);
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once when component mounts

  return (
    <html>
      <body>
        <nav className="sidebar">
          <Logo />
          <ul>
            <li>
              <a href="/">
                <i className="fas fa-chart-bar"></i> Dashboard
              </a>
            </li>
            <li>
              <a href="scan">
                <i className="fas fa-search"></i> Scan
              </a>
            </li>
            <li>
              <a href="history">
                <i className="fas fa-history"></i> History
              </a>
            </li>
            <li className="bottompart">
              <a className="" href="login">
                <i className="fas fa-sign-in-alt"></i> Login
              </a>
            </li>
          </ul>
        </nav>

        <div className="main-content">
          <h1 className="main-text">This is the scanning page.</h1>
          <div className="info-container">
            <div className="scan-container">
              <input
                className="urlpaste"
                type="text"
                id="urlInput"
                placeholder="Enter URL"
              />

              <button id="startScanButton" className="scanbutton">
                Start Scan
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default ScanPage;
