"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Logo from "./components/logo";
import LastScannedWebsites from "./components/LastScannedWebsites";
import "./homestyle.css";
import "./components/LastScannedWebsitescss.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Home() {
  const [totalScans, setTotalScans] = useState(0);
  const [totalVulnerabilities, setTotalVulnerabilities] = useState(0);
  const [latestScannedSite, setLatestScannedSite] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Ensure this is false initially

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
  // Fetch dashboard data if user is logged in
  if (isLoggedIn) {
    const fetchDashboardData = async () => {
  try {
    const [
      totalScansResponse,
      totalVulnerabilitiesResponse,
      latestScannedSiteResponse,
    ] = await Promise.all([
      axios.get("/totalscans"),
      axios.get("/totalvulnerabilities"),
      axios.get("/lastscanned5websites"), // Updated endpoint name
    ]);

    // Handle total scans response
    if (totalScansResponse && totalScansResponse.data && totalScansResponse.data.totalScans !== undefined) {
      setTotalScans(totalScansResponse.data.totalScans);
    } else {
      console.error("Invalid response for total scans");
    }

    // Handle total vulnerabilities response
    if (totalVulnerabilitiesResponse && totalVulnerabilitiesResponse.data && totalVulnerabilitiesResponse.data.totalVulnerabilities !== undefined) {
      setTotalVulnerabilities(totalVulnerabilitiesResponse.data.totalVulnerabilities);
    } else {
      console.error("Invalid response for total vulnerabilities");
    }

    // Handle latest scanned site response
    if (latestScannedSiteResponse && Array.isArray(latestScannedSiteResponse.data) && latestScannedSiteResponse.data.length > 0) {
      setLatestScannedSite(latestScannedSiteResponse.data[0]);
    } else {
      console.error("Invalid response for latest scanned sites");
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Handle network errors or other exceptions
    // Optionally, you can set state variables to default values or show an error message to the user
  }
};

    fetchDashboardData();
  }
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

  return (
    <div className="container">
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
            <a href="#" onClick={handleLoginClick}>
              <i className={`fas ${isLoggedIn ? "fa-sign-out-alt" : "fa-sign-in-alt"}`}></i>{" "}
              {isLoggedIn ? "Logout" : "Login"}
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
        />
      </div>
    </div>
  );
}