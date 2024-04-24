


const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');

const secretKey = 'SecureRandomString'; // should be replaced with a secure random string

// Create MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  
    password: 'Hard.reach.ces?77', 
    database: 'vulscan_database'  
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('MySQL connection failed:', err);
        throw err;
    }
    console.log('Connected to MySQL database.');
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Token is required' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.userId = decoded.id;
        next();
    });
}

// Function to generate JWT token
function generateToken(userId) {
    return jwt.sign({ id: userId }, secretKey, { expiresIn: '1h' });
}

// Entry point
function login(req, res) {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ error: 'An error occurred during login' });
        }
        if (results.length === 0 || !bcrypt.compareSync(password, results[0].password)) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = generateToken(results[0].id);
        res.json({ token });
    });
}

module.exports = {
    verifyToken,
    login
};
