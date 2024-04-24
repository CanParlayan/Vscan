


const mysql = require('mysql');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'Hard.reach.ces?77', 
    database: 'vulscan_database'
});

db.connect((err) => {
    if (err) {
        console.error('MySQL connection failed:', err);
        throw err;
    }
    console.log('Connected to MySQL database.');

    const sqlCommands = `
    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        password VARCHAR(255)
    );

    CREATE TABLE table_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        site_url VARCHAR(255),
        timestamp VARCHAR(255),
        has_sqli INT,
        has_header INT,
        has_xss INT,
        has_outdated INT,
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE header_recommendations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        table_info_id INT,
        recommendation TEXT,
        header_name VARCHAR(255),
        FOREIGN KEY (table_info_id) REFERENCES table_info(id)
    );

    CREATE TABLE xss_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        table_info_id INT,
        vulnerability_type VARCHAR(255),
        form_action VARCHAR(255),
        form_inputs TEXT,
        form_method VARCHAR(255),
        FOREIGN KEY (table_info_id) REFERENCES table_info(id)
    );

    CREATE TABLE sqli_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        table_info_id INT,
        vulnerability_type VARCHAR(255),
        form_action VARCHAR(255),
        form_inputs TEXT,
        form_method VARCHAR(255),
        FOREIGN KEY (table_info_id) REFERENCES table_info(id)
    );

    CREATE TABLE outdated_details (
        id INT AUTO_INCREMENT PRIMARY KEY,
        table_info_id INT,
        vulnerability_type VARCHAR(255),
        component TEXT,
        version VARCHAR(255),
        CVE VARCHAR(255),
        up_to_date_version VARCHAR(255),
        FOREIGN KEY (table_info_id) REFERENCES table_info(id)
    );
    `;

    db.query(sqlCommands, (err, result) => {
        if (err) {
            console.error("Error executing SQL commands:", err);
            throw err;
        }
        console.log("SQL commands executed successfully.");
    });
});

db.end((err) => {
    if (err) {
        console.error('Error closing MySQL connection:', err);
        throw err;
    }
    console.log('Closed MySQL database connection.');
});
