    const express = require('express');
    const bodyParser = require('body-parser');
    const { spawn } = require('child_process');
    const next = require('next');
    const dev = process.env.NODE_ENV !== 'production';
    const nextApp = next({ dev });
    const cors = require('cors');
    const http = require('http');
    const WebSocket = require('ws');
    const mysql = require('mysql');
    const bcrypt = require('bcrypt');
    let setup = false;
    const saltRounds = 10; // Number of salt rounds for hashing
    const session = require('express-session');
    const MySQLStore = require('express-mysql-session')(session);
    const crypto = require('crypto');
    const handle = nextApp.getRequestHandler();
    function generateRandomSessionSecret(length = 32) {
        // Generate random bytes
        const randomBytes = crypto.randomBytes(length);

        // Convert bytes to hexadecimal string
        return randomBytes.toString('hex');
    }

    // Function to create a new user
    async function createUser(username, email, password) {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = {
            username,
            email,
            password_hash: hashedPassword
        };
        await pool.query('INSERT INTO Users SET ?', newUser);
    }


    if(setup){
        createUser('can', 'can@mail.com', 'can');
        console.log("Created user")
    }



    require('dotenv').config();
const pool = mysql.createPool({
  connectionLimit: 10, // Adjust this based on your application needs
  host: process.env.host_ip,
  port: 3306,
  user: process.env.host_name,
  password: process.env.host_pw,
  database: process.env.db_name
});

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

        app.use(bodyParser.json());
        const sessionStore = new MySQLStore({
            host: process.env.host_ip,
            port: 3306,
            user: process.env.host_name,
            password: process.env.host_pw,
            database: process.env.db_name,
            clearExpired: true,
            checkExpirationInterval: 900000, // Cleanup expired sessions every 15 minutes
            expiration: 86400000, // Session expires after 1 day (in milliseconds)
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
    // If user is logged in, redirect to another page (e.g., dashboard)
    res.redirect('/');
  } else {
    // User is not logged in, proceed to next middleware or route handler
    next();
  }
}



        app.post('/start-scan', requireLogin, (req, res) => {
            const {url, quiet, depth, xsspayload, nohttps, sqlipayload, scan_types} = req.body;
            if (!url) {
                return res.status(400).json({error: 'URL is required'});
            }

            const pythonPath = 'C:\\Users\\hcparlayan\\AppData\\Local\\Programs\\Python\\Python312\\python';  //will be added to .env
            const scriptPath = 'C:\\Users\\hcparlayan\\WebstormProjects\\OWASP-Top-Scanner2\\main.py'; //will be added to .env
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
                                client.send(JSON.stringify({type: 'scan_output', message: line}));
                            }
                        });
                    });
                });


                pythonProcess.on('close', (code) => {
                    console.log('Python process exited with code:', code);
                    const message = code === 0 ? 'Scan completed successfully' : `Scan failed with exit code ${code}`;

                    wss.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({type: 'scan_output', message}));
                        }
                    });

                    if (code === 0) {
                        res.json({message: 'Scan completed successfully'});
                    } else {
                        res.status(500).json({error: 'An error occurred during scanning'});
                    }
                });

            } catch (error) {
                console.error('Error spawning Python process:', error);
                res.status(500).json({error: 'Internal server error'});
            }
        });

        app.get('/totalvulnerabilities', requireLogin, (req, res) => {
            const query = 'SELECT COUNT(*) AS totalVulnerabilities FROM Vulnerabilities';
            pool.query(query, (err, result) => {
                if (err) {
                    console.error('Error querying total vulnerabilities:', err);
                    res.status(500).json({error: 'Internal server error'});
                    return;
                }
                const totalVulnerabilities = result[0].totalVulnerabilities;
                res.json({totalVulnerabilities});
            });
        });
         app.get('/check-auth', requireLogin, (req, res) => {
    // If requireLogin middleware passes, the user is authenticated
    res.json({ authenticated: true, user: req.session.user });
  });

app.post('/login', requireLogin,async (req, res) => {
  const { email, password } = req.body; // Ensure 'email' matches frontend data structure
  console.log(`Received login request for email: ${email}`);

  try {
    const results = await getUserByUsername(email);
    console.log(`Query results for email ${email}:`, results);

    if (results.length === 0) {
      console.log(`No user found for username: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = results[0];
    console.log(`User found:`, user);

    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log(`Password match result: ${isMatch}`);

    if (isMatch) {
      req.session.user = user;
      console.log(`User ${email} logged in successfully.`);
      return res.status(200).json({ success: true, message: 'Login successful' });
    } else {
      console.log(`Invalid password for username: ${email}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json({ success: true, message: 'Logout successful' });
  });
});

        app.get('/totalscans', requireLogin, (req, res) => {
            const query = 'SELECT COUNT(*) AS totalScans FROM Scans';
            pool.query(query, (err, result) => {
                if (err) {
                    console.error('Error querying total scans:', err);
                    res.status(500).json({error: 'Internal server error'});
                    return;
                }
                const totalScans = result[0].totalScans;
                res.json({totalScans});
            });
        });

        app.get('/lastscannedwebsites', requireLogin, (req, res) => {
            const query = 'SELECT name, pdfLink, date FROM Scans ORDER BY date DESC LIMIT 5';
            pool.query(query, (err, results) => {
                if (err) {
                    console.error('Error querying last scanned websites:', err);
                    res.status(500).json({error: 'Internal server error'});
                    return;
                }
                res.json(results);
            });
        });

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
