"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import axios from "axios";
import "./style.css";
import Logo from "../components/logo";
import "@fortawesome/fontawesome-free/css/all.min.css";

const ScanPage = () => {
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanOutput, setScanOutput] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status

  const [flags, setFlags] = useState({
    quiet: false,
    depth: "",
    xsspayload: "",
    nohttps: false,
    sqlipayload: "",
    scan_types: [] as string[],
  });

  const handleLoginClick = () => {
    if (isLoggedIn) {
      // Perform logout actions
      setIsLoggedIn(false);
      localStorage.removeItem("accessToken"); // Clear stored token
      window.location.href = "/login"; // Redirect to login page
    } else {
      // Redirect to login page if not logged in
      window.location.href = "/login";
    }
  };
  // Inside ScanPage component
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === "checkbox" ? checked : value;

    setFlags((prevFlags) => ({
      ...prevFlags,
      [name]: newValue,
    }));
  };

  const handleCheckBoxChange = (event: {
    target: { name: any; value: any; checked: any };
  }) => {
    const { name, value, checked } = event.target;

    setFlags((prevFlags) => ({
      ...prevFlags,
      scan_types: checked
        ? [...prevFlags.scan_types, value]
        : prevFlags.scan_types.filter((type) => type !== value),
    }));
  };

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:9000");

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "scan_output") {
        setScanOutput((prevOutput) => prevOutput + "\n" + data.message);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      socket.close();
    };
  }, []); // Empty dependency array ensures this effect runs only once

  useEffect(() => {
    // Check authentication status
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("/check-auth");
        const { authenticated } = response.data;
        setIsLoggedIn(authenticated);
      } catch (error) {
        console.error("Error checking authentication status:", error);
      }
    };

    checkAuthStatus();
  }, []);
  // Adjust startScan function to handle scan response
  const startScan = async () => {
    setIsScanning(true);
    try {
      const response = await axios.post("http://localhost:8000/start-scan", {
        url,
        ...flags,
      });
      console.log(response.data.message); // Log server response message
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
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
            {/* Render login or logout button based on isLoggedIn state */}
            <a className="" href="#" onClick={handleLoginClick}>
              <i
                className={`fas ${
                  isLoggedIn ? "fa-sign-out-alt" : "fa-sign-in-alt"
                }`}
              ></i>{" "}
              {isLoggedIn ? "Logout" : "Login"}
            </a>
          </li>
        </ul>
      </nav>
      <div className="main-content">
        <h1 className="main-text">Scan your web page</h1>
        <div className="scan-container">
          <input
            type="text"
            name="url"
            placeholder="Enter URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <label>
            Quiet Mode
            <input
              type="checkbox"
              name="quiet"
              checked={flags.quiet}
              onChange={handleInputChange}
            />
          </label>
          <input
            type="text"
            name="depth"
            placeholder="Depth"
            value={flags.depth}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="xsspayload"
            placeholder="XSS Payload"
            value={flags.xsspayload}
            onChange={handleInputChange}
          />
          <label>
            No HTTPS
            <input
              type="checkbox"
              name="nohttps"
              checked={flags.nohttps}
              onChange={handleInputChange}
            />
          </label>
          <input
            type="text"
            name="sqlipayload"
            placeholder="SQL Injection Payload"
            value={flags.sqlipayload}
            onChange={handleInputChange}
          />
          <div>
            <label>Select Scan Type:</label>
            <div>
              <label>
                <input
                  type="checkbox"
                  name="scan_types"
                  value="xss"
                  checked={flags.scan_types.includes("xss")}
                  onChange={handleCheckBoxChange}
                />
                Cross-Site Scripting (XSS)
              </label>
              <label>
                <input
                  type="checkbox"
                  name="scan_types"
                  value="headers"
                  checked={flags.scan_types.includes("headers")}
                  onChange={handleCheckBoxChange}
                />
                Headers
              </label>
              <label>
                <input
                  type="checkbox"
                  name="scan_types"
                  value="sqli"
                  checked={flags.scan_types.includes("sqli")}
                  onChange={handleCheckBoxChange}
                />
                SQL Injection (SQLi)
              </label>
              <label>
                <input
                  type="checkbox"
                  name="scan_types"
                  value="outdated"
                  checked={flags.scan_types.includes("outdated")}
                  onChange={handleCheckBoxChange}
                />
                Outdated Software
              </label>
              <label>
                <input
                  type="checkbox"
                  name="scan_types"
                  value="crypto"
                  checked={flags.scan_types.includes("crypto")}
                  onChange={handleCheckBoxChange}
                />
                Crypto
              </label>
            </div>
          </div>

          {scanOutput && (
            <div className="output-container">
              <h3>Scan Output:</h3>
              <pre className="scan-output">{scanOutput}</pre>
            </div>
          )}
          <button className="button" onClick={startScan} disabled={isScanning}>
            {isScanning ? "Scanning..." : "Start Scan"}
          </button>
        </div>
      </div>
    </body>
  );
};

export default ScanPage;
