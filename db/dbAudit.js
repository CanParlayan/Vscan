const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./db.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Read JSON data from file
fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading file:", err);
        return;
    }

    const jsonData = JSON.parse(data);

    // Insert data into the database
    db.serialize(() => {
        // Insert data into table_info table
        db.run(
            `INSERT INTO table_info (site_url, timestamp, has_sqli, has_header, has_xss, has_outdated, user_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [jsonData.site_url, jsonData.timestamp, 1, 1, 1, 1, 1], // Assuming user_id is 1
            function (err) {
                if (err) {
                    console.error("Error inserting data into table_info:", err);
                } else {
                    console.log(`Row inserted into table_info with ID: ${this.lastID}`);
                }
            }
        );

        // Insert data into header_recommendations table
        jsonData.audit_details.forEach((detail) => {
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
        const xssDetailIndex = jsonData.audit_details.findIndex(detail => detail.startsWith("[Vulnerability] Found XSS vulnerability"));
        if (xssDetailIndex !== -1) {
            const xssDetail = jsonData.audit_details[xssDetailIndex];
            const xssData = JSON.parse(jsonData.audit_details[xssDetailIndex + 1]);
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
    });
});

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Close the database connection.');
});
