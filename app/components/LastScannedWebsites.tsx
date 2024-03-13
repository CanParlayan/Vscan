// components/LastScannedWebsites.tsx
import React from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface Website {
  date: String;
  name: string;
  pdfLink: string;
}

interface LastScannedWebsitesProps {
  lastScannedWebsites: Website[];
}

const LastScannedWebsites: React.FC<LastScannedWebsitesProps> = ({
  lastScannedWebsites,
}) => {
  const lastFiveScans = lastScannedWebsites.slice(5);
  return (
    <div className="history">
      <h2 className="title">Last Scanned Websites</h2>
      <div className="last-scanned-container">
        <div className="last-scanned-list">
          {lastFiveScans.map(({ name, pdfLink, date }, index) => (
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
  );
};

export default LastScannedWebsites;
