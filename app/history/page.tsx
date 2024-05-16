"use client";
import React, { useEffect, useState } from "react";
import Logo from "../components/logo";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";

const History = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lastScannedWebsites, setLastScannedWebsites] = useState([]);

  // Function to fetch last scanned websites data
  const fetchLastScannedWebsites = async () => {
    try {
      const response = await axios.get("http://localhost:8000/last-scanned");
      setLastScannedWebsites(response.data);
    } catch (error) {
      console.error("Error fetching last scanned websites:", error);
    }
  };

  useEffect(() => {
    // Check authentication status when component mounts
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
    fetchLastScannedWebsites();
  }, []);

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

  // Redirect to login page if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      window.location.href = "/login";
    }
  }, [isLoggedIn]);

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
          <h1 className="main-text">This is the history page.</h1>
          <div className="history">
            <h2 className="title">Last Scanned Websites</h2>
            <div className="last-scanned-container">
              <div className="last-scanned-list">
                {lastScannedWebsites.map((website, index) => (
                  <div key={index} className="last-scanned-item">
                    <span>{website.name}</span>
                    <span className="date">{website.date}</span>
                    <a
                      href={website.pdfLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdf-link"
                    >
                      <i className="fas fa-image"></i> PDF
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default History;
