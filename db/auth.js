const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

const secretKey = 'TemplateSecretKey'; // Change this to a secure random string

// Open SQLite database connection
const db = new sqlite3.Database('./db.db');

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

// Login endpoint
function login(req, res) {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
        if (err) {
            console.error('Login error:', err);
            return res.status(500).json({ error: 'An error occurred during login' });
        }
        if (!row || !bcrypt.compareSync(password, row.password)) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = generateToken(row.id);
        res.json({ token });
    });
}

module.exports = {
    verifyToken,
    login
};
