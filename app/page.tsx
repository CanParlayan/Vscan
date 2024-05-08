"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import LastScannedWebsites from "./components/LastScannedWebsites";
import Logo from "./components/logo";
import "./homestyle.css";
import "./components/LastScannedWebsitescss.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Home() {
  const [totalScans, setTotalScans] = useState(0);
  const [totalVulnerabilities, setTotalVulnerabilities] = useState(0);
  const [latestScannedSite, setLatestScannedSite] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const lastScannedWebsites = [
    // Your sample data for lastScannedWebsites
  ];

  useEffect(() => {
    // Fetch total scans, vulnerabilities, and latest scanned site
    const fetchDashboardData = async () => {
      try {
        const [totalScansResponse, totalVulnerabilitiesResponse, latestScannedSiteResponse] = await Promise.all([
          axios.get("/audited-total-sites"),
          axios.get("/total-vulnerabilities"),
          axios.get("/latest-scanned-site")
        ]);

        setTotalScans(totalScansResponse.data.totalSites);
        setTotalVulnerabilities(totalVulnerabilitiesResponse.data.totalVulnerabilities);
        setLatestScannedSite(latestScannedSiteResponse.data.latestScannedSite);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []); // Empty dependency array ensures useEffect runs only once

  const handleLoginClick = () => {
    if (isLoggedIn) {
      alert("You are already logged in!");
    } else {
      // Navigate to login page if not logged in
      window.location.href = "/login";
    }
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
              <a className="" href="#" onClick={handleLoginClick}>
                <i className="fas fa-sign-in-alt"></i> Login
              </a>
            </li>
          </ul>
        </nav>

        <div className="main-content">
          <h1 className="main-text">Welcome back!</h1>

          <div className="info-container">
            <div className="graph">
              <h1>GRAPH</h1>
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
            lastScannedWebsites={latestScannedSite ? [latestScannedSite] : []}
            /* lastScannedWebsites={lastScannedWebsites} */
          />
        </div>
      </body>
    </html>
  );
}
