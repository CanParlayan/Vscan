import React, { useState, useEffect, ReactElement } from "react";
import axios from "axios";
import "./homestyle.css";
import LastScannedWebsites from "./components/LastScannedWebsites";
import "./components/LastScannedWebsitescss.css";

interface ScannedWebsite {
    // Define the properties of a scanned website here
}

// This is a Client Component
function DataFetcher(): ReactElement {
    const [totalScans, setTotalScans] = useState<number>(0);
    const [totalVulnerabilities, setTotalVulnerabilities] = useState<number>(0);
    const [lastScannedWebsites, setLastScannedWebsites] = useState<ScannedWebsite[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch total scans
            const totalScansResponse = await axios.get('http://localhost:8000/totalscans');
            setTotalScans(totalScansResponse.data.totalScans);

            // Fetch total vulnerabilities
            const totalVulnerabilitiesResponse = await axios.get('http://localhost:8000/totalvulnerabilities');
            setTotalVulnerabilities(totalVulnerabilitiesResponse.data.totalVulnerabilities);

            // Fetch last scanned websites
            const lastScannedWebsitesResponse = await axios.get('http://localhost:8000/lastscanned5websites');
            setLastScannedWebsites(lastScannedWebsitesResponse.data.lastScannedWebsites);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <Home
            totalScans={totalScans}
            totalVulnerabilities={totalVulnerabilities}
            lastScannedWebsites={lastScannedWebsites}
        />
    );
}

interface HomeProps {
    totalScans: number;
    totalVulnerabilities: number;
    lastScannedWebsites: ScannedWebsite[];
}

// This is a Server Component
function Home({ totalScans, totalVulnerabilities, lastScannedWebsites }: HomeProps): any {
    // Render the UI based on the props
    // ...
}

export default DataFetcher;