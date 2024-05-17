import React from "react";

interface LastScannedWebsitesProps {
  lastScannedWebsites: Website[];
}

interface Website {
  target_url: string;
  scan_timestamp: string;
  pdfLink: string;
}

const LastScannedWebsites: React.FC<LastScannedWebsitesProps> = ({
  lastScannedWebsites,
}) => {
  const reversedData = lastScannedWebsites.reverse();

  return (
    <div className="history">
      <h2 className="title">Last Scanned Websites</h2>
      <div className="last-scanned-container">
        <div className="last-scanned-list">
          {reversedData.map(({ target_url, scan_timestamp }, index) => (
            <div key={index} className="last-scanned-item">
              <span>{target_url}</span>
              <span className="date">
                {new Date(scan_timestamp).toLocaleString()}
              </span>
              <a
                href=""
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
