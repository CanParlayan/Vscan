import "./style.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import React from "react";

export default function history() {
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

  const reversedData = lastScannedWebsites.reverse();

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
          <h1 className="main-text">This is the history page.</h1>
          <div className="history">
            <h2 className="title">Last Scanned Websites</h2>
            <div className="last-scanned-container">
              <div className="last-scanned-list">
                {reversedData.map(({ name, pdfLink, date }, index) => (
                  <div key={index} className="last-scanned-item">
                    <span>{name}</span>
                    <span className="date">{date}</span>
                    <a
                      href={pdfLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pdf-link"
                    >
                      <i className="fas fa-image"></i>
                      PDF
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
}
