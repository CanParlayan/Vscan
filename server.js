const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const mysql = require('mysql');



require('dotenv').config();
const connection = mysql.createConnection({
  host: '13.51.193.119',
  port: 3306,
  user: 'root',
  password: 'dota',
  database: 'vscandb'
});

connection.connect();

connection.query('SELECT * from users', function(err, rows, fields) {
    if(err) console.log(err);
    console.log('The solution is: ', rows);
    connection.end();
});
nextApp.prepare().then(() => {
    const app = express();
    http.createServer(app);
    const wss = new WebSocket.Server({ port: 9000 });
    const port = 8000;
app.use(cors());
    app.use(bodyParser.json());

    // WebSocket server handling
    wss.on('connection', (ws) => {
        console.log('WebSocket connected');

        // Handle messages from the WebSocket client
        ws.on('message', (message) => {
            console.log(`Received message from client: ${message}`);
        });
    });
// Authentication middleware
const authenticateUser = (req, res, next) => {
  if (req.session && req.session.user) {
    next(); // User is authenticated, proceed
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};


app.post('/start-scan',authenticateUser, (req, res) => {
    const { url, quiet, depth, xsspayload, nohttps, sqlipayload, scan_types } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const pythonPath = 'C:\\Users\\hcparlayan\\AppData\\Local\\Programs\\Python\\Python312\\python';
    const scriptPath = 'C:\\Users\\hcparlayan\\WebstormProjects\\OWASP-Top-Scanner2\\main.py';
    const args = [
        '--url', url,
        quiet && '-q',
        depth && '--depth', depth,
        xsspayload && '--xsspayload', xsspayload,
        nohttps && '--nohttps',
        sqlipayload && '--sqlipayload', sqlipayload,
        scan_types && '--scan-type', scan_types
    ].filter(Boolean);

    try {
        const pythonProcess = spawn(pythonPath, [scriptPath, ...args]);

        pythonProcess.stdout.on('data', (data) => {
    const output = data.toString().trim(); // Convert stdout data to string
    console.log('Python output:', output);

    // Split output into lines and broadcast each line to WebSocket clients
    output.split('\n').forEach((line) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'scan_output', message: line }));
            }
        });
    });
});


        pythonProcess.on('close', (code) => {
    console.log('Python process exited with code:', code);
    const message = code === 0 ? 'Scan completed successfully' : `Scan failed with exit code ${code}`;

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'scan_output', message }));
        }
    });

    if (code === 0) {
        res.json({ message: 'Scan completed successfully' });
    } else {
        res.status(500).json({ error: 'An error occurred during scanning' });
    }
});

    } catch (error) {
        console.error('Error spawning Python process:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/totalvulnerabilities', (req, res) => {
  const query = 'SELECT COUNT(*) AS totalVulnerabilities FROM Vulnerabilities';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error querying total vulnerabilities:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    const totalVulnerabilities = result[0].totalVulnerabilities;
    res.json({ totalVulnerabilities });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM Users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, result) => {
    if (err) {
      console.error('Error querying login:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    if (result.length > 0) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
});

app.get('/totalscans',authenticateUser, (req, res) => {
  const query = 'SELECT COUNT(*) AS totalScans FROM Scans';
  db.query(query, (err, result) => {
    if (err) {
      console.error('Error querying total scans:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    const totalScans = result[0].totalScans;
    res.json({ totalScans });
  });
});

app.get('/lastscannedwebsites',authenticateUser, (req, res) => {
  const query = 'SELECT name, pdfLink, date FROM Scans ORDER BY date DESC LIMIT 5';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error querying last scanned websites:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});


    // Let Next.js handle all other routes
    app.all('*', (req, res, next) => {
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
