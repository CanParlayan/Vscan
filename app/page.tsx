import React from "react";
import "./homestyle.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import LastScannedWebsites from "./components/LastScannedWebsites";
import "./components/LastScannedWebsitescss.css";

export default function Home() {
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
  return (
    <html>
      <body>
        <nav className="navBar">
          <div className="logo">SCANNER</div>
          <div className="nav-content">
            <i className="fa-regular fa-moon"></i>
            &nbsp; &nbsp; &nbsp;
            <i className="fa-solid fa-user"></i>
          </div>
        </nav>

        <nav className="sidebar">
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
          </ul>
        </nav>

        <div className="main-content">
          <h1 className="main-text">
            This is a website vulnerability scanner.
          </h1>

          <div className="info-container">
            <div className="graph">
              <h1>GRAPH</h1>
            </div>

            <div className="card">
              <h6>Total scans:</h6>
              <h3 className="carddata">12</h3>
            </div>
            <div className="card">
              <h6>Total Vulnerabilities:</h6>
              <h3 className="carddata">8</h3>
            </div>
          </div>

          <LastScannedWebsites lastScannedWebsites={lastScannedWebsites} />
        </div>
      </body>
    </html>
  );
}
