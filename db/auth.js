const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');

const secretKey = 'GüvenliRastgeleDize'; // güvenli rastgele bir dizeye değiştirilmeliyz

// MySQL bağlantısını oluştur
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Hard.reach.ces?77', 
    database: 'vulscan_database' 
});

// Bağlantım
db.connect((err) => {
    if (err) {
        console.error('MySQL bağlantısı başarısız:', err);
        throw err;
    }
    console.log('MySQL veritabanına bağlanıldı.');
});

// JWT token'ı doğrulamak için ara yazılım
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Token gereklidir' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Geçersiz token' });
        }
        req.userId = decoded.id;
        next();
    });
}

// JWT token üretme fonksiyonum
function generateToken(userId) {
    return jwt.sign({ id: userId }, secretKey, { expiresIn: '1h' });
}

// Giriş noktam
function login(req, res) {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Giriş hatası:', err);
            return res.status(500).json({ error: 'Giriş sırasında bir hata oluştu' });
        }
        if (results.length === 0 || !bcrypt.compareSync(password, results[0].password)) {
            return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
        }

        const token = generateToken(results[0].id);
        res.json({ token });
    });
}

module.exports = {
    verifyToken,
    login
};
