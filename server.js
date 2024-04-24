const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
    const app = express();
    const port = 5000;

    app.use(bodyParser.json());
    app.get('/audited-total-sites', (req, res) => {
        db.get('SELECT COUNT(*) AS totalSites FROM table_info', (err, row) => {
            if (err) {
                console.error(err.message);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json({ totalSites: row.totalSites });
        });
    });

// Define API endpoint to get last 4 scanned site details
    app.get('/latest-scanned-site', (req, res) => {
        db.get('SELECT * FROM table_info ORDER BY timestamp DESC LIMIT 4', (err, row) => {
            if (err) {
                console.error(err.message);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json({ latestScannedSite: row });
        });
    });

// Define API endpoint to get total vulnerabilities
    app.get('/total-vulnerabilities', (req, res) => {
        db.get('SELECT COUNT(*) AS totalVulnerabilities FROM xss_details UNION SELECT COUNT(*) FROM sqli_details UNION SELECT COUNT(*) FROM outdated_details', (err, row) => {
            if (err) {
                console.error(err.message);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json({ totalVulnerabilities: row.totalVulnerabilities });
        });
    });
    
    function login(req, res) {
        const { username, password } = req.body;

        // Check if username and password are provided
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Hardcoded credentials (replace with your actual authentication logic)
        const validUsername = 'admin';
        const validPassword = 'password';

        // Check if provided credentials match the hardcoded credentials
        if (username === validUsername && password === validPassword) {
            // Authentication successful
            return res.json({ message: 'Login successful' });
        } else {
            // Authentication failed
            return res.status(401).json({ error: 'Invalid username or password' });
        }
    }

    app.post('/login', login);
// Assuming you're using Express.js for your server
    app.post('/write-to-database', (req, res) => {
        const scanData = req.body;
        const fs = require('fs');
        const sqlite3 = require('sqlite3').verbose();

        let db = new sqlite3.Database('./db.db', (err) => {
            if (err) {
                console.error(err.message);
                res.status(500).json({ error: 'Database connection error' });
                return;
            }
            console.log('Connected to the SQLite database.');
        });

        // Insert data into the database
        db.serialize(() => {
            // Insert data into table_info table
            db.run(
                `INSERT INTO table_info (site_url, timestamp, has_sqli, has_header, has_xss, has_outdated, user_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [scanData.site_url, scanData.timestamp, 1, 1, 1, 1, 1], // Assuming user_id is 1
                function (err) {
                    if (err) {
                        console.error("Error inserting data into table_info:", err);
                        res.status(500).json({ error: 'Error inserting data into table_info' });
                        return;
                    }
                    console.log(`Row inserted into table_info with ID: ${this.lastID}`);

                    // Insert data into header_recommendations table
                    scanData.audit_details.forEach((detail) => {
                        if (detail.startsWith("[Recommendation]")) {
                            const recommendation = detail.replace("[Recommendation]", "").trim();
                            db.run(
                                `INSERT INTO header_recommendations (table_info_id, recommendation) 
                            VALUES (?, ?)`,
                                [this.lastID, recommendation],
                                function (err) {
                                    if (err) {
                                        console.error("Error inserting data into header_recommendations:", err);
                                    } else {
                                        console.log(`Row inserted into header_recommendations with ID: ${this.lastID}`);
                                    }
                                }
                            );
                        }
                    });

                    // Insert data into xss_details table
                    const xssDetailIndex = scanData.audit_details.findIndex(detail => detail.startsWith("[Vulnerability] Found XSS vulnerability"));
                    if (xssDetailIndex !== -1) {
                        const xssDetail = scanData.audit_details[xssDetailIndex];
                        const xssData = JSON.parse(scanData.audit_details[xssDetailIndex + 1]);
                        db.run(
                            `INSERT INTO xss_details (table_info_id, vulnerability_type, form_action, form_inputs, form_method) 
                        VALUES (?, ?, ?, ?, ?)`,
                            [this.lastID, "XSS", xssDetail.split(":")[1].trim(), JSON.stringify(xssData.inputs), xssData.method],
                            function (err) {
                                if (err) {
                                    console.error("Error inserting data into xss_details:", err);
                                } else {
                                    console.log(`Row inserted into xss_details with ID: ${this.lastID}`);
                                }
                            }
                        );
                    }
                }
            );
        });

        db.close((err) => {
            if (err) {
                console.error(err.message);
                res.status(500).json({ error: 'Database connection error' });
                return;
            }
            console.log('Close the database connection.');
            res.json({ message: 'Data inserted into database successfully' });
        });
    });

    app.post('/start-scan', (req, res) => {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        const pythonProcess = spawn('C:\\Users\\canpa\\AppData\\Local\\Programs\\Python\\Python312\\python.exe', ['./scanner.py', '--url', url]);

        pythonProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            if (code === 0) {
                res.json({ message: 'Scan completed successfully' });
            } else {
                res.status(500).json({ error: 'An error occurred during scanning' });
            }
        });
    });

    // Let Next.js handle all other routes
    app.all('*',(req, res) => {
        return handle(req, res);
    });

    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch((err) => {
    console.error('Error starting Next.js:', err);
    process.exit(1);
});