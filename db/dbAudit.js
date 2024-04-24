


const fs = require('fs');
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
});


fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading file:", err);
        return;
    }

    const jsonData = JSON.parse(data);

    db.query('INSERT INTO table_info (site_url, timestamp, has_sqli, has_header, has_xss, has_outdated, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [jsonData.site_url, jsonData.timestamp, 1, 1, 1, 1, 1], (err, result) => {
            if (err) {
                console.error("Error inserting data into table_info table:", err);
                throw err;
            }
            console.log(`Data inserted into table_info table with ID: ${result.insertId}`);


            jsonData.audit_details.forEach((detail) => {
                if (detail.startsWith("[Recommendation]")) {
                    const recommendation = detail.replace("[Recommendation]", "").trim();
                    db.query('INSERT INTO header_recommendations (table_info_id, recommendation) VALUES (?, ?)',
                        [result.insertId, recommendation], (err, result) => {
                            if (err) {
                                console.error("Error inserting data into header_recommendations table:", err);
                                throw err;
                            }
                            console.log(`Data inserted into header_recommendations table with ID: ${result.insertId}`);
                        });
                }
            });


            const xssDetailIndex = jsonData.audit_details.findIndex(detail => detail.startsWith("[Vulnerability] Found XSS vulnerability"));
            if (xssDetailIndex !== -1) {
                const xssDetail = jsonData.audit_details[xssDetailIndex];
                const xssData = JSON.parse(jsonData.audit_details[xssDetailIndex + 1]);
                db.query('INSERT INTO xss_details (table_info_id, vulnerability_type, form_action, form_inputs, form_method) VALUES (?, ?, ?, ?, ?)',
                    [result.insertId, "XSS", xssDetail.split(":")[1].trim(), JSON.stringify(xssData.inputs), xssData.method], (err, result) => {
                        if (err) {
                            console.error("Error inserting data into xss_details table:", err);
                            throw err;
                        }
                        console.log(`Data inserted into xss_details table with ID: ${result.insertId}`);
                    });
            }
        });
});

db.end((err) => {
    if (err) {
        console.error('Error closing MySQL connection:', err);
        throw err;
    }
    console.log('Closed MySQL database connection.');
});
