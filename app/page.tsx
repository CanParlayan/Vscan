"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import LastScannedWebsites from "./components/LastScannedWebsites";
import Logo from "./components/logo";
import "./homestyle.css";
import "./components/LastScannedWebsitescss.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Home() {
  const [totalScans, setTotalScans] = useState(0);
  const [username, setUsername] = useState(null);
  const [totalVulnerabilities, setTotalVulnerabilities] = useState(0);
  const [latestScannedSite, setLatestScannedSite] = useState<any[] | null>(
    null
  );

  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login status

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
  useEffect(() => {
    // Fetch latest scanned website
    axios
      .get("/scanned-websites")
      .then((response) => {
        const { scannedSites } = response.data;
        if (scannedSites.length > 0) {
          setLatestScannedSite(scannedSites);
        }
      })
      .catch((error) => {
        console.error("Error fetching latest scanned website:", error);
      });
  }, [isLoggedIn]);

  useEffect(() => {
    // Fetch total scans
    axios
      .get("/totalscans")
      .then((response) => {
        setTotalScans(response.data.totalScans);
      })
      .catch((error) => {
        console.error("Error fetching total scans:", error);
      });

    // Fetch total vulnerabilities
    axios
      .get("/totalvulnerabilities")
      .then((response) => {
        setTotalVulnerabilities(response.data.totalVulnerabilities);
      })
      .catch((error) => {
        console.error("Error fetching total vulnerabilities:", error);
      });
    // Fetch username
    axios
      .get("/username")
      .then((response) => {
        setUsername(response.data.username);
      })
      .catch((error) => {
        console.error("Error fetching username:", error);
      });
  }, [isLoggedIn]);

  const handleLoginClick = () => {
    if (isLoggedIn) {
      // Perform logout actions
      setIsLoggedIn(false); // Set isLoggedIn to false
      localStorage.removeItem("accessToken"); // Example of clearing access token from local storage
    }
    // Redirect to the login page regardless of login or logout action
    window.location.href = "/login";
  };

  const data = {
    labels: ["Total Scans", "Total Vulnerabilities"],
    datasets: [
      {
        label: "Scans and Vulnerabilities",
        data: [totalScans, totalVulnerabilities],
        backgroundColor: ["#9966FF", "#FF6384"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

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
              <a href="#" onClick={handleLoginClick}>
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
          <h1 className="main-text">Welcome back! {username}</h1>

          <div className="info-container">
            <div className="graph">
              <Pie data={data} />
            </div>

            <div className="card">
              <h6>Total scans:</h6>
              <h3 className="carddata">{totalScans}</h3>
            </div>
            <div className="card">
              <h6>Total Vulnerabilities:</h6>
              <h3 className="carddata">{totalVulnerabilities}</h3>
            </div>
          </div>

          <LastScannedWebsites
            lastScannedWebsites={
              latestScannedSite ? latestScannedSite.slice(-5) : []
            }
          />
        </div>
      </body>
    </html>
  );
}
