"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Chart, registerables } from "chart.js";
import { Bar } from "react-chartjs-2";
import LastScannedWebsites from "./components/LastScannedWebsites";
import Logo from "./components/logo";
import "./homestyle.css";
import "./components/LastScannedWebsitescss.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

Chart.register(...registerables);

export default function Home() {
  const [totalScans, setTotalScans] = useState(0);
  const [totalVulnerabilities, setTotalVulnerabilities] = useState(0);
  const [xsstotal, setxsstotal] = useState(0);
  const [sqlitotal, setsqlitotal] = useState(0);
  const [username, setUsername] = useState(null);
  const [latestScannedSite, setLatestScannedSite] = useState<any[] | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);



  useEffect(() => {
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
    axios.get("/scanned-websites")
      .then((response) => {
        console.log(response)
        const { scannedSites } = response.data;
        if (scannedSites.length > 0) {
          const updatedSites = scannedSites.map((site: any) => ({
  ...site,
  pdfLink: `/download-report/${site.scan_id}` // Use scan_id instead of scanId
}));

          setLatestScannedSite(updatedSites.reverse()); // Reverse if needed
        }
      })
      .catch((error) => {
        console.error("Error fetching latest scanned website:", error);
      });
  }, [isLoggedIn]);

  useEffect(() => {
    axios.get("/totalscans")
      .then((response) => {
        setTotalScans(response.data.totalScans);
      })
      .catch((error) => {
        console.error("Error fetching total scans:", error);
      });

    axios.get("/totalvulnerabilities")
      .then((response) => {
        setTotalVulnerabilities(response.data.totalVulnerabilities);
      })
      .catch((error) => {
        console.error("Error fetching total vulnerabilities:", error);
      });

    axios.get("/vulnerabilityCounts")
      .then((response) => {
        const { xssCount, sqliCount } = response.data;
        setxsstotal(xssCount);
        setsqlitotal(sqliCount);
      })
      .catch((error) => {
        console.error("Error fetching vulnerability counts:", error);
      });

    axios.get("/username")
      .then((response) => {
        setUsername(response.data.username);
      })
      .catch((error) => {
        console.error("Error fetching username:", error);
      });
  }, [isLoggedIn]);

  const handleLoginClick = () => {
    if (isLoggedIn) {
      setIsLoggedIn(false);
      localStorage.removeItem("accessToken");
    }
    window.location.href = "/login";
  };

  const data = {
    labels: ["Total Scans", "Total Vulnerabilities", "XSS Total", "SQLi Total"],
    datasets: [
      {
        label: "Vulnerability Data",
        backgroundColor: [
          "rgba(75, 192, 192, 0.2)",
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(54, 162, 235, 0.2)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(54, 162, 235, 1)",
        ],
        borderWidth: 1,
        data: [totalScans, totalVulnerabilities, xsstotal, sqlitotal],
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
                <i className={`fas ${isLoggedIn ? "fa-sign-out-alt" : "fa-sign-in-alt"}`}></i>
                {isLoggedIn ? "Logout" : "Login"}
              </a>
            </li>
          </ul>
        </nav>

        <div className="main-content">
          <h1 className="main-text">Welcome back {username}!</h1>

          <div className="info-container">
            <div className="graph">
              <Bar data={data} />
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
            lastScannedWebsites={latestScannedSite ? latestScannedSite.slice(0, 4) : []}
          />
        </div>
      </body>
    </html>
  );
}
