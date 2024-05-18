"use client";
import React, { useEffect, useState } from "react";
import Logo from "../components/logo";
import "@fortawesome/fontawesome-free/css/all.min.css";
import axios from "axios";
import "./style.css";
import LastScannedWebsites from "../components/LastScannedWebsites";
import "../components/LastScannedWebsitescss.css";
const History = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lastScannedWebsites, setLastScannedWebsites] = useState<any[] | null>(
    null
  );

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
    const fetchScannedWebsites = async () => {
      try {
        const response = await axios.get("/scanned-websites");
        const { scannedSites } = response.data;
        if (scannedSites.length > 0) {
          const reversedSites = scannedSites.reverse();
          // Map scanned websites to include pdfLink based on scan_id
          const updatedSites = reversedSites.map((site: any) => ({
            ...site,
            pdfLink: `/download-report/${site.scan_id}`,
          }));
          setLastScannedWebsites(updatedSites);
        }
      } catch (error) {
        console.error("Error fetching latest scanned website:", error);
      }
    };

    fetchScannedWebsites();
  }, [isLoggedIn]);

  const handleLoginClick = () => {
    if (isLoggedIn) {
      setIsLoggedIn(false);
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    } else {
      // Handle login logic
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
          <h1 className="main-text">This is the history page.</h1>
          <LastScannedWebsites
            lastScannedWebsites={lastScannedWebsites ? lastScannedWebsites : []}
          />
        </div>
      </body>
    </html>
  );
};

export default History;
