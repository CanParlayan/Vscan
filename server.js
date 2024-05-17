    const express = require('express');
    const bodyParser = require('body-parser');
    const { spawn } = require('child_process');
    const next = require('next');
    const dev = process.env.NODE_ENV !== 'production';
    const nextApp = next({ dev });
    const cors = require('cors');
    const cookieParser = require('cookie-parser');
    const http = require('http');
    const WebSocket = require('ws');
    const mysql = require('mysql');
    const bcrypt = require('bcrypt');
    const axios = require('axios');
    let setup = false;
    const saltRounds = 10; // Number of salt rounds for hashing
    const session = require('express-session');
    const MySQLStore = require('express-mysql-session')(session);
    const crypto = require('crypto');
    const fs = require("fs");
    const handle = nextApp.getRequestHandler();
    function generateRandomSessionSecret(length = 32) {
        // Generate random bytes
        const randomBytes = crypto.randomBytes(length);

        // Convert bytes to hexadecimal string
        return randomBytes.toString('hex');
    }

    // Function to create a new user
async function createUser(username, email, password) {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = {
            username,
            email,
            password_hash: hashedPassword
        };
        const result = await pool.query('INSERT INTO Users SET ?', newUser);
        console.log("Created User " + newUser.username);
        console.log("Database Insert Result:", result);
        return result;
        await pool.getConnection(async (connection) => {
    try {
        await connection.beginTransaction();
        // Perform database operations
        await connection.query('INSERT INTO Users SET ?', newUser);
        await connection.commit();
        console.log('Transaction committed successfully');
    } catch (error) {
        await connection.rollback();
        console.error('Error performing database operations:', error);
        throw new Error('Database transaction failed.');
    } finally {
        connection.release();
    }
});

    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Failed to create user. Please try again.');
    }
}




    if(setup){
        createUser('can', 'can@mail.com', 'can')
    .then(result => {
        console.log('User created successfully:', result);
    })
    .catch(error => {
        console.error('Error creating user:', error);
    });

    }



    require('dotenv').config();
try {
  // Create a MySQL connection pool
  pool = mysql.createPool({
    connectionLimit: 10, // Adjust this based on your application needs
    host: process.env.host_ip,
    port: 3306,
    user: process.env.host_name,
    password: process.env.host_pw,
    database: process.env.db_name
  });

  console.log('MySQL connection pool created successfully');
} catch (error) {
  console.error('Error creating MySQL connection pool:', error.message);
}



// Function to query the database
function executeQuery(sql, values) {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

// Example usage:
async function getUserByUsername(username) {
  try {
      return await executeQuery('SELECT * FROM Users WHERE email = ?', [username]);
  } catch (error) {
    throw new Error(`Error querying user: ${error.message}`);
  }
}

// Now use this function in your /login endpoint:

    nextApp.prepare().then(() => {
        const app = express();
        http.createServer(app);
        const wss = new WebSocket.Server({port: process.env.SOCKETPORT || 9000});
        const port = process.env.PORT || 8000;
        app.use(cors());
app.use(cookieParser());
        app.use(bodyParser.json());
        const sessionStore = new MySQLStore({
            host: process.env.host_ip,
            port: 3306,
            user: process.env.host_name,
            password: process.env.host_pw,
            database: process.env.db_name,
            clearExpired: true,
            checkExpirationInterval: 300000, // Cleanup expired sessions every 15 minutes
            expiration: 1800000, // Session expires after 1 day (in milliseconds)
        });
        const sessionSecret = generateRandomSessionSecret();
        app.use(session({
            secret: sessionSecret,
            resave: false,
            saveUninitialized: false,
            store: sessionStore,
            cookie: {secure: false} // Set 'secure: true' if using HTTPS
        }));
        // WebSocket server handling
        wss.on('connection', (ws) => {
            console.log('WebSocket connected');

            // Handle messages from the WebSocket client
            ws.on('message', (message) => {
                console.log(`Received message from client: ${message}`);
            });
        });
    // Authentication middleware
    // Function to authenticate user
function requireLogin(req, res, next) {
  if (req.session && req.session.user) {
    // User is authenticated, proceed to the next middleware
    next();
  } else {
    // User is not authenticated, redirect to login page
    res.redirect('/login');
  }
}

app.post('/start-scan', requireLogin, async (req, res) => {
    const userId = req.cookies.userId;
    const { url, quiet, depth, xsspayload, nohttps, sqlipayload, scan_types } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    const startDate = new Date();
    const formattedStartDate = formatDate(startDate);
    console.log('Scan started at:', formattedStartDate);

    const pythonPath = process.env.python_path;
    const scriptPath = process.env.SCRIPT_PATH;
    const args = [
        '--url', url,
        quiet && '-q',
        depth && '--depth', depth,
        xsspayload && '--xsspayload', xsspayload,
        nohttps && '--nohttps',
        sqlipayload && '--sqlipayload', sqlipayload,
        scan_types && '--scan-type', scan_types
    ].filter(Boolean);

    const pythonProcess = spawn(pythonPath, [scriptPath, ...args]);
    console.log("Scan started officially");
    pythonProcess.stdout.on('data', (data) => {
        console.log('Python output:', data.toString().trim());
    });

    pythonProcess.on('close', async (code) => {
        console.log('Python process exited with code:', code);
        const reports_path = process.env.REPORTS_PATH;

        try {
            const parsedData = await tryLoadReport(reports_path, startDate);
            const pdffilename = "report_" + formatDate(startDate) + ".pdf";
            const pdfPath = reports_path + pdffilename;
            await saveAuditDataToDatabase(parsedData, userId, pdfPath);
            res.json({ message: 'Scan completed successfully' });
        } catch (error) {
            console.error('Error processing report:', error);
            res.status(500).json({ error: 'Failed to process report' });
        }
    });
});



function formatDate(date, minuteOffset = 0) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + (date.getMinutes() + minuteOffset)).slice(-2);

    return `${year}${month}${day}-${hours}${minutes}`;
}

async function tryLoadReport(reportsPath, baseDate) {
    const filenames = [
        "report_" + formatDate(baseDate) + ".json",
        "report_" + formatDate(baseDate, 1) + ".json"
    ];

    for (const filename of filenames) {
        const filePath = reportsPath + filename;
        if (fs.existsSync(filePath)) {
            const data = parsedAuditData(filePath);
            fs.unlinkSync(filePath);  // Delete the file after loading
            return data;
        }
    }
    throw new Error('Report file not found for the given time.');
}


function timeCheck(timestamp){
    console.log('Time Check:', timestamp);
}


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const results = await getUserByUsername(email);

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
      req.session.user = user;
        console.log('User Authenticated:', req.session && req.session.user); // Check user authentication status
        res.cookie('userId', req.session.user.user_id, { maxAge: 86400000 }); // Cookie expires in 24 hours (in milliseconds)
      return res.status(200).json({ success: true, message: 'Login successful' });

    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/check-auth', (req, res) => {
  if (req.session && req.session.user) {
    // If the session exists and user is logged in
    res.json({ authenticated: true, user: req.session.user });
  } else {
    // No active session or user is not logged in
    res.json({ authenticated: false });
  }
});


app.post('/logout', (req, res) => {
    if (req.session) {
        const sessionId = req.session.id;
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            // Manually remove session from session store
            sessionStore.destroy(sessionId, (err) => {
                if (err) {
                    console.error('Error removing session from store:', err);
                }
                res.json({ success: true, message: 'Logout successful' });
            });
        });
    } else {
        res.json({ success: true, message: 'Logout successful' });
    }
});
function parsedAuditData(filename) {
    let parsedData = {
        siteUrl: '',
        isHttps: false,
        timestamp: '',
        ipDetails: { hostname: '', ip: '' },
        openPorts: [],
        headerCheckResults: {},
        clickjackingAlert: '',
        crawledUrls: [],
        xssVulnerabilities: [],
        sqliVulnerabilities: [],
        outdatedComponents: [],
        cryptoCiphers: [],
        sslCertIssuer: '',
        sslCertDate: ''
    };

    try {
        const fileData = fs.readFileSync(filename, 'utf8');
        const data = JSON.parse(fileData);

        // Populate parsedData with extracted data
        parsedData.siteUrl = data.site_url || '';
        parsedData.isHttps = parsedData.siteUrl.startsWith('https');
        parsedData.timestamp = data.timestamp ? formatTimestamp(data.timestamp) : '';
const auditDetails = data['Audit Details'];
        if (auditDetails && auditDetails['enum'] && Array.isArray(auditDetails['enum']['details']) && auditDetails['enum']['details'].length > 0) {
    const nmapDetails = auditDetails['enum']['details'][0];

    // Use try-catch to handle potential errors when processing nmapDetails
    try {
        const ipMatch = nmapDetails.match(/Nmap scan report for (\S+) \((\d+\.\d+\.\d+\.\d+)\)/);
        if (ipMatch && ipMatch.length >= 3) {
            const hostname = ipMatch[1];
            const ipAddress = ipMatch[2];

            // Proceed with using hostname and ipAddress
            parsedData.ipDetails.hostname = hostname;
            parsedData.ipDetails.ip = ipAddress;

            // Extract open ports
            const openPorts = nmapDetails.matchAll(/(\d+)\/tcp\s+open\s+(\S+)/g);
            for (const match of openPorts) {
                const port = match[1];
                const service = match[2];
                parsedData.openPorts.push({ port, service });
            }
        } else {
            console.log('Invalid nmap details format:', nmapDetails);
        }
    } catch (error) {
        console.error('Error processing nmap details:', error);
        // Handle the error gracefully without stopping execution
    }
} else {
    console.log('Audit details structure does not match expected format or is missing "enum" or "details"');
}


        // Extract SQLi vulnerabilities
        if (data['Audit Details']['sqli']) {
            data['Audit Details']['sqli'].forEach((sqli_vuln, index) => {
                const sqliVulnerability = {
                    url: sqli_vuln.URL,
                    payload: sqli_vuln.Payload,
                    type: sqli_vuln.Type
                };
                parsedData.sqliVulnerabilities.push(sqliVulnerability);
            });
        }

        // Extract header check results and clickjacking alert
        if (data['Audit Details'] && data['Audit Details']['headerCheck']) {
    parsedData.headerCheckResults = data['Audit Details']['headerCheck'][parsedData.siteUrl] || {};
}
if (data['Audit Details'] && data['Audit Details']['clickjacking']) {
    parsedData.clickjackingAlert = (data['Audit Details']['clickjacking'][parsedData.siteUrl] || [])[0];
}


        // Handle outdated components
const outdatedComponents = auditDetails?.outdated?.['Detected Components'] || {};
        Object.entries(outdatedComponents).forEach(([componentName, componentInfo]) => {
            const component = {
                componentName,
                currentVersion: componentInfo['Current Version'] || '',
                latestVersion: componentInfo['Latest Version'] || '',
                status: componentInfo['Status'] || '',
                cveDetails: [] // Initialize an array to hold CVE details
            };

            // Check if CVE entries exist for the current component
            const cveEntries = auditDetails?.outdated?.cve?.[componentName] || {};
            Object.entries(cveEntries).forEach(([cveId, cveDescription]) => {
                const cveDetail = {
                    cveId,
                    cveDescription
                };
                component.cveDetails.push(cveDetail);
            });

            parsedData.outdatedComponents.push(component);
        });

        // Extract XSS vulnerabilities
        if (data['Audit Details']['Xss Vulnerabilties']) {
    data['Audit Details']['Xss Vulnerabilties'].forEach(xssVuln => {
       const inputs = xssVuln.details && xssVuln.details.inputs ? xssVuln.details.inputs.map(input => ({
    type: input.type || '',
    name: input.name || '',
    value: input.value || ''
})) : [];

const vulnerability = {
    url: xssVuln.url || '',
    inputs: inputs,
    action: xssVuln.details?.action || '',
    method: xssVuln.details?.method || '',
    payload: xssVuln.payload || ''
};
parsedData.xssVulnerabilities.push(vulnerability);
});
        }




        // Extract crawled URLs
        parsedData.crawledUrls = data['Collected URLs'] || [];
        // Handle crypto ciphers
        if (data['Audit Details']['crypto'] && data['Audit Details']['crypto']['ciphers']) {
    data['Audit Details']['crypto']['ciphers'].forEach(cipherInfo => {
        const [cipherName, cipherScore] = cipherInfo;
        parsedData.cryptoCiphers.push({ cipherName, cipherScore });
    });
}


        // Extract SSL certificate issuer and date
        parsedData.sslCertIssuer = data['Audit Details']['crypto']['sslCertInfo'][0];
parsedData.sslCertDate = data['Audit Details']['crypto']['sslCertInfo'][1];

    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log(`Error: File '${filename}' not found.`);
        } else {
            console.log(`Error: An unexpected error occurred: ${err}`);
        }
    }

    return parsedData;
}

function formatTimestamp(timestamp) {
    try {
        const year = timestamp.substring(0, 4);
        const month = timestamp.substring(4, 6) - 1; // Month is 0-based in Date object (0 = January)
        const day = timestamp.substring(6, 8);
        const hours = timestamp.substring(9, 11);
        const minutes = timestamp.substring(11, 13);

        // Create a new Date object with explicit time zone offset (+03 in this case)
        const dateObj = new Date(Date.UTC(year, month, day, hours-3, minutes));
        if (isNaN(dateObj)) {
            throw new Error('Invalid timestamp');
        }

        // Adjust the time zone offset to match the desired timezone (e.g., +03)
        const localDateObj = new Date(dateObj.getTime() + (3 * 60 * 60 * 1000)); // +03:00 in milliseconds

        return localDateObj.toISOString().replace('T', ' ').split('.')[0];
    } catch (error) {
        console.log(`Error formatting timestamp: ${error}`);
        return ''; // or handle the error as per your requirement
    }
}




function getCurrentUserId(req) {
    if (req.session && req.session.user) {
        return req.session.user.id; // Assuming 'id' is the field in 'user' object that holds user ID
    }
    return null; // Return null if user is not authenticated
}
async function saveAuditDataToDatabase(parsedData, userId,reportFilePath) {
    let scanId;
    let siteUrl = parsedData.siteUrl;
    let scan_timestamp = parsedData.timestamp;
    let vulnerabilityInsertPromises = [];


    try {
        const userExists = await new Promise((resolve, reject) => {
    pool.query(
        'SELECT user_id FROM Users WHERE user_id = ?',
        [userId],
        (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.length > 0); // Check if user with given ID exists
            }
        }
    );
});

if (!userExists) {
    console.error(`Error: User with user_id ${userId} does not exist.`);
    // Handle the error (e.g., throw an error or return from function)
    return;
}
        const scanInsertResult = await new Promise((resolve, reject) => {
            pool.query(
                'INSERT INTO Scans (user_id, scan_timestamp, target_url) VALUES (?, ?, ?)',
                [userId, scan_timestamp, siteUrl],
                (error, results, fields) => {
                    if (error) {
                        console.error('Error inserting data into Scans table:', error);
                        reject(error);
                    } else {
                        console.log('Scan data inserted successfully.');
                        scanId = results.insertId;
                        resolve();
                    }
                }
            );
        });

        // Stringify openPorts array for open_ports_name column
        const openPortsJson = JSON.stringify(parsedData.openPorts);

        await new Promise((resolve, reject) => {
            pool.query(
                'INSERT INTO ScannedSites (scan_id, is_https, ip_address, open_ports) VALUES (?, ?, ?, ?)',
                [scanId, parsedData.isHttps, parsedData.ipDetails.ip, openPortsJson],
                (error, results, fields) => {
                    if (error) {
                        console.error('Error inserting data into ScannedSites table:', error);
                        reject(error);
                    } else {
                        console.log('Scanned site data inserted successfully.');
                        resolve();
                    }
                }
            );});
         console.log('Scanned site data inserted successfully.');

        // Insert crawled URLs into 'CrawledUrls' table
        for (const url of parsedData.crawledUrls) {
            await new Promise((resolve, reject) => {
                pool.query(
                    'INSERT INTO CrawledUrls (url, scan_id) VALUES (?, ?)',
                    [url, scanId],
                    (error, results, fields) => {
                        if (error) {
                            console.error('Error inserting crawled URL data into CrawledUrls table:', error);
                            reject(error);
                        } else {
                            resolve();
                        }
                    }
                );
            });
        }

        console.log('Crawled URLs inserted successfully.');

        // Insert SSL certificate data into 'SSLCertificates' table
// Insert SSL certificate data into 'SSLCertificates' table
// Assuming parsedData is the object containing the SSL certificate data

// Check if the SSL certificate issuer and date are present
        if (parsedData.sslCertIssuer && parsedData.sslCertDate) {
            await new Promise((resolve, reject) => {
                pool.query(
                    'INSERT INTO SSLCertificates (site_id, issuer, valid_until) VALUES (?, ?, ?)',
                    [scanId, parsedData.sslCertIssuer, parsedData.sslCertDate],
                    (error, results, fields) => {
                        if (error) {
                            console.error('Error inserting SSL certificate data:', error);
                            reject(error); // Log and reject the error
                        } else {
                            console.log('SSL certificate data inserted successfully.');
                            resolve();
                        }
                    }
                );
            }).catch(error => {
                // Handle the error gracefully here if needed
                console.error('Failed to insert SSL data:', error);
            });
        } else {
            console.log('No SSL certificate data available, skipping database insertion.');
        }

        // Insert headers data into 'Headers' table
        // Iterate over keys of headerCheckResults object
for (const headerName in parsedData.headerCheckResults) {
    if (parsedData.headerCheckResults.hasOwnProperty(headerName)) {
        await new Promise((resolve, reject) => {
            pool.query(
                'INSERT INTO Headers (site_id, header_name, is_missing, clickjacking) VALUES (?, ?, ?, ?)',
                [scanId, headerName, true, parsedData.clickjackingAlert === 'Possible clickjacking vulnerability detected.'],
                (error, results, fields) => {
                    if (error) {
                        console.error('Error inserting header data into Headers table:', error);
                        reject(error);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }
}


        // Insert XSS vulnerabilities into 'Vulnerabilities' table
        for (const vulnerability of parsedData.xssVulnerabilities) {
            const {payload, action, method, inputs, url} = vulnerability;
            if (payload || action || method || url) {
                await new Promise((resolve, reject) => {
                    pool.query(
                        'INSERT INTO Vulnerabilities (scan_id, vulnerability_type, payload, action, method, sqlitype, Inputs, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [scanId, "XSS", payload, action, method, null, JSON.stringify(inputs || {}), url],
                        (error, results, fields) => {
                            if (error) {
                                console.error('Error inserting XSS vulnerability:', error);
                                reject(error);
                            } else {
                                resolve();
                            }
                        }
                    );
                });
            } else {
                console.error('Error: Missing required properties in XSS vulnerability data.');
            }
        }
         parsedData.outdatedComponents.forEach((component) => {
            const { cveDetails, componentName, currentVersion, latestVersion, status } = component;
            const cveId = cveDetails && cveDetails[0] && cveDetails[0].cveId;
            const cveDescription = cveDetails && cveDetails[0] && cveDetails[0].cveDescription;
            const params = [
                scanId,
                componentName,
                currentVersion,
                latestVersion,
                status,
                cveId || null,
                cveDescription || null
            ];
            const insertQuery = `
                INSERT INTO OutdatedComponents 
                (scan_id, component_name, current_version, latest_version, status, cve_id, cve_description) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            vulnerabilityInsertPromises.push(pool.query(insertQuery, params));
        });

        for (const vulnerability of parsedData.sqliVulnerabilities) {
    const { payload, url, type } = vulnerability;

    if (payload && url && type) {
        await new Promise((resolve, reject) => {
            const insertQuery = `
                INSERT INTO Vulnerabilities 
                (scan_id, vulnerability_type, payload, action, method, sqlitype, Inputs, url) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            pool.query(
                insertQuery,
                [scanId, "SQLI", payload, null, null, type, null, url],
                (error, results, fields) => {
                    if (error) {
                        console.error('Error inserting SQLI vulnerability:', error);
                        reject(error);
                    } else {
                        console.log('SQLI vulnerability inserted successfully.');
                        resolve();
                    }
                }
            );
        });
    } else {
        console.error('Error: Missing required properties in SQLI vulnerability data.');
    }
}
        // Insert crypto ciphers into 'CryptoCiphers' table
for (const cipher of parsedData.cryptoCiphers) {
    await new Promise((resolve, reject) => {
        const insertQuery = `
            INSERT INTO CryptoCiphers (scan_id, cipher_name, cipher_score) 
            VALUES (?, ?, ?)
        `;

        pool.query(
            insertQuery,
            [scanId, cipher.cipherName, cipher.cipherScore],
            (error, results, fields) => {
                if (error) {
                    console.error('Error inserting CryptoCiphers data:', error);
                    reject(error);
                } else {
                    console.log('Crypto cipher inserted successfully.');
                    resolve();
                }
            }
        );
    });
}
const fs = require('fs');
const path = require('path');

// Additional logging to check the report file path
console.log(`Report file path: ${reportFilePath}`);

// Check if the file exists and is a .pdf
if (fs.existsSync(reportFilePath)) {
    const fileExtension = path.extname(reportFilePath);
    if (fileExtension !== '.pdf') {
        console.error(`Error: Report file is not a PDF. Found: ${fileExtension}`);
        return;
    }
} else {
    console.error('Error: Report file does not exist.');
    return;
}

// Read the file as a BLOB
fs.readFile(reportFilePath, (err, reportContent) => {
    if (err) {
        console.error('Error reading report file:', err);
        return;
    }

    pool.query(
        'INSERT INTO Reports (user_id, scan_id, report) VALUES (?, ?, ?)',
        [userId, scanId, reportContent],
        (error, results, fields) => {
            if (error) {
                console.error('Error inserting data into Reports table:', error);
                return;
            } else {
                console.log('Report file inserted successfully into Reports table.');

                // Delete the report file after insertion
                fs.unlink(reportFilePath, (err) => {
                    if (err) {
                        console.error('Error deleting report file:', err);
                    } else {
                        console.log('Report file deleted successfully.');
                    }
                });
            }
        }
    );
});

        // Wait for all vulnerability insertions to complete
        await Promise.all(vulnerabilityInsertPromises);

         console.log('All audit data inserted successfully.');

    } catch (error) {
        console.error('Error saving audit data:', error);
        throw error;
    }
}

app.get('/totalscans', requireLogin, (req, res) => {
    const userId = getCurrentUserId(req); // Get the current user's ID
    const query = 'SELECT COUNT(*) AS totalScans FROM Scans WHERE user_id = ?'; // Update the query to use a placeholder

    pool.query(query, [userId], (err, result) => { // Pass userId as a parameter to the query
        if (err) {
            console.error('Error querying total scans:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Check if result is empty or undefined
        if (!result || !result[0] || !result[0].totalScans && result[0].totalScans !== 0) {
            console.error('No total scans found in the result');
            res.status(404).json({ error: 'Total scans not found' });
            return;
        }

        const totalScans = result[0].totalScans;
        console.log("Total Scans: " + totalScans);
        res.json({ totalScans });
    });
});
app.get('/vulnerabilityCounts', requireLogin, (req, res) => {
    const userId = getCurrentUserId(req); // Get the current user's ID from the request
    const query = `
        SELECT
            SUM(CASE WHEN vulnerability_type = 'XSS' THEN 1 ELSE 0 END) AS xssCount,
            SUM(CASE WHEN vulnerability_type = 'SQLI' THEN 1 ELSE 0 END) AS sqliCount
        FROM Vulnerabilities v
        JOIN Scans s ON v.scan_id = s.scan_id
        WHERE s.user_id = ?
    `; // Join Vulnerabilities and Scans tables and filter by user_id

    pool.query(query, [userId], (err, result) => { // Pass userId as a parameter to the query
        if (err) {
            console.error('Error querying vulnerability counts:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Check if result is empty or undefined
        if (!result || !result[0]) {
            console.error('No vulnerability counts found in the result');
            res.status(404).json({ error: 'Vulnerability counts not found' });
            return;
        }

        const xssCount = result[0].xssCount || 0;
        const sqliCount = result[0].sqliCount || 0;
        console.log("XSS Count: " + xssCount);
        console.log("SQLI Count: " + sqliCount);
        res.json({ xssCount, sqliCount });
    });
});


app.get('/totalvulnerabilities', requireLogin, (req, res) => {
    const userId = getCurrentUserId(req); // Get the current user's ID from the request
    const query = `
        SELECT COUNT(*) AS totalVulnerabilities
        FROM Vulnerabilities v
        JOIN Scans s ON v.scan_id = s.scan_id
        WHERE s.user_id = ?
    `; 

    pool.query(query, [userId], (err, result) => { // Pass userId as a parameter to the query
        if (err) {
            console.error('Error querying total vulnerabilities:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Check if result is empty or undefined
        if (!result || !result[0] || result[0].totalVulnerabilities === undefined || result[0].totalVulnerabilities === null) {
            console.error('No total vulnerabilities found in the result');
            res.status(404).json({ error: 'Total vulnerabilities not found' });
            return;
        }

        const totalVulnerabilities = result[0].totalVulnerabilities;
        console.log("Total Vulnerabilities: " + totalVulnerabilities);
        res.json({ totalVulnerabilities });
    });
});


app.get('/download-report/:scanId', async (req, res) => {
    const userId = getCurrentUserId(req);
    const scanId = req.params.scanId;


    console.log(`Request received for scanId: ${scanId} by userId: ${userId}`);

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    try {
      const reportData = await new Promise((resolve, reject) => {
        pool.query(
          'SELECT Reports.report ' +
          'FROM Reports ' +
          'INNER JOIN Scans ON Reports.scan_id = Scans.scan_id ' +
          'WHERE Reports.scan_id = ? AND Scans.user_id = ?',
          [scanId, userId],
          (error, results) => {
            if (error) {
              console.error('Database query error:', error);
              return reject(error);
            }
            if (results.length === 0) {
              console.warn(`No report found or unauthorized access for scan ID: ${scanId} and user ID: ${userId}`);
              return reject(new Error('No report found for this scan ID or unauthorized access.'));
            }
            console.log('Query results:', results);
            resolve(results[0].report);
          }
        );
      });

      if (!reportData) {
        console.error('Report data is undefined or null');
        throw new Error('Report data is undefined or null');
      }

      // Debugging: Log headers and data type
      console.log('Headers set:');
      console.log('Content-Type:', 'application/pdf');
      console.log('Content-Disposition:', 'attachment; filename=report.pdf');
      console.log('Report data type:', typeof reportData);
      console.log('Report data length:', reportData.length);

      // Set the content type and disposition header for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');

      // Send the report file content as a PDF
      res.send(Buffer.from(reportData, 'binary'));
    } catch (error) {
      console.error('Error downloading report:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

app.get('/scanned-websites', async (req, res) => {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
  
    try {
      const scannedSites = await new Promise((resolve, reject) => {
        pool.query(
          'SELECT Scans.scan_id, Scans.target_url, Scans.scan_timestamp, Reports.report ' +
          'FROM Scans ' +
          'LEFT JOIN Reports ON Scans.scan_id = Reports.scan_id ' +
          'WHERE Scans.user_id = ?',
          [userId],
          (error, results) => {
            if (error) {
              return reject(error);
            }
            resolve(results);
          }
        );
      });
  
      res.json({ scannedSites }); // Include scanId in the response
    } catch (error) {
      console.error('Error retrieving scanned websites:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});


  app.get('/username', async (req, res) => {
    try {
        const userId = getCurrentUserId(req);

        // Fetch the username from the database using the user ID
          pool.query('SELECT username FROM Users WHERE user_id = ?', [userId], (error, results, fields) => {
            if (error) {
                console.error("Error fetching username:", error);
                return res.status(500).json({ error: "An error occurred while fetching the username." });
            }

            // Check if a user with the given ID exists
            if (results.length === 0) {
                return res.status(404).json({ error: "User not found." });
            }

            // User found, send the username in the response
            res.json({ username: results[0].username });
        });

    } catch (error) {
        console.error("Error fetching username:", error);
        res.status(500).json({ error: "An error occurred while fetching the username." });
    }
});

function getCurrentUserId(req) {
    const userId = req.cookies.userId
    if (userId) {
        return userId;
    }
    return null;
}


        app.all('*', (req, res) => {
        // Check if user is authenticated

            return handle(req, res);
    });




    // Start the HTTP server
            app.listen(port, () => {
                console.log(`Server is running on http://localhost:${port}`);
                console.log('WebSocket server running on ws://localhost:9000');
            });
        }).catch((err) => {
            console.error('Error starting Next.js:', err);
            process.exit(1);
        });
