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
    // Check authentication status when component mounts
    const checkAuthStatus = async () => {
      try {
        axios
          .get("/check-auth")
          .then((response) => {
            const { authenticated } = response.data;
            setIsLoggedIn(authenticated);
          })
          .catch((error) => {
            console.error("Error checking authentication status:", error);
          });
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
          const reversedSites = scannedSites.reverse(); // Reverse the array
          setLastScannedWebsites(reversedSites); // Set the reversed array in state
        }
      })
      .catch((error) => {
        console.error("Error fetching latest scanned website:", error);
      });
  }, [isLoggedIn]);

  const handleLoginClick = () => {
    if (isLoggedIn) {
      // Perform logout actions
      setIsLoggedIn(false);
      localStorage.removeItem("accessToken"); // Clear stored token
      window.location.href = "/login"; // Redirect to login page
    } else {
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
          <LastScannedWebsites
            lastScannedWebsites={lastScannedWebsites ? lastScannedWebsites : []}
          />
        </div>
      </body>
    </html>
  );
};

export default History;
