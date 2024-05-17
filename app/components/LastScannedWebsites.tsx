import React from "react";

interface LastScannedWebsitesProps {
  lastScannedWebsites: Website[];
}

interface Website {
  target_url: string;
  scan_timestamp: string;
  pdfLink: string;
}

const LastScannedWebsites: React.FC<LastScannedWebsitesProps> = ({ lastScannedWebsites }) => {
  return (
    <div className="history">
      <h2 className="title">Last Scanned Websites</h2>
      <div className="last-scanned-container">
        <div className="last-scanned-list">
          {lastScannedWebsites.map(({ target_url, scan_timestamp, pdfLink }, index) => (
            <div key={index} className="last-scanned-item">
              <span className="url">{target_url}</span>
              <span className="date">{new Date(scan_timestamp).toLocaleString()}</span>
              <a href={pdfLink} target="_blank" rel="noopener noreferrer" className="pdf-link">
                <i className="fas fa-file-pdf"></i> PDF
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LastScannedWebsites;
