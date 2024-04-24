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
  const lastScannedWebsites = [
    { name: "Website 1", pdfLink: "link1.pdf", date: "2023-03-01" },
    { name: "Website 2", pdfLink: "link2.pdf", date: "2023-02-15" },
    { name: "Website 3", pdfLink: "link3.pdf", date: "2023-02-28" },
    { name: "Website 4", pdfLink: "link4.pdf", date: "2023-03-05" },
    { name: "Website 5", pdfLink: "link5.pdf", date: "2023-02-20" },
    { name: "Website 6", pdfLink: "link6.pdf", date: "2023-03-02" },
    { name: "Website 7", pdfLink: "link7.pdf", date: "2023-03-10" },
    { name: "Website 8", pdfLink: "link8.pdf", date: "2023-02-25" },
    { name: "Website 9", pdfLink: "link9.pdf", date: "2023-03-15" },
    { name: "Website 10", pdfLink: "link10.pdf", date: "2023-02-18" },
    { name: "Website 1", pdfLink: "link1.pdf", date: "2023-03-01" },
    { name: "Website 2", pdfLink: "link2.pdf", date: "2023-02-15" },
    { name: "Website 3", pdfLink: "link3.pdf", date: "2023-02-28" },
    { name: "Website 4", pdfLink: "link4.pdf", date: "2023-03-05" },
    { name: "Website 5", pdfLink: "link5.pdf", date: "2023-02-20" },
    { name: "Website 6", pdfLink: "link6.pdf", date: "2023-03-02" },
    { name: "Website 7", pdfLink: "link7.pdf", date: "2023-03-10" },
    { name: "Website 8", pdfLink: "link8.pdf", date: "2023-02-25" },
    { name: "Website 9", pdfLink: "link9.pdf", date: "2023-03-15" },
    { name: "Website 10", pdfLink: "link10.pdf", date: "2023-02-18" },
  ];

  useEffect(() => {
    // Fetch total scans
    axios
      .get("/audited-total-sites")
      .then((response) => {
        setTotalScans(response.data.totalSites);
      })
      .catch((error) => {
        console.error("Error fetching total scans:", error);
      });

    // Fetch total vulnerabilities
    axios
      .get("/total-vulnerabilities")
      .then((response) => {
        setTotalVulnerabilities(response.data.totalVulnerabilities);
      })
      .catch((error) => {
        console.error("Error fetching total vulnerabilities:", error);
      });

    // Fetch latest scanned site
    axios
      .get("/latest-scanned-site")
      .then((response) => {
        setLatestScannedSite(response.data.latestScannedSite);
      })
      .catch((error) => {
        console.error("Error fetching latest scanned site:", error);
      });
  }, []); // Empty dependency array ensures useEffect runs only once

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
          <h1 className="main-text">Welcome back! </h1>

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
