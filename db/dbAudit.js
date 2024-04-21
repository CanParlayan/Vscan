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
        console.error('MySQL bağlantısı başarısız:', err);
        throw err;
    }
    console.log('MySQL veritabanına bağlanıldı.');
});


fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
        console.error("Dosya okunurken hata oluştu:", err);
        return;
    }

    const jsonData = JSON.parse(data);

    db.query('INSERT INTO table_info (site_url, timestamp, has_sqli, has_header, has_xss, has_outdated, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [jsonData.site_url, jsonData.timestamp, 1, 1, 1, 1, 1], (err, result) => {
            if (err) {
                console.error("table_info tablosuna veri eklenirken hata oluştu:", err);
                throw err;
            }
            console.log(`table_info tablosuna ID: ${result.insertId} ile veri eklendi`);


            jsonData.audit_details.forEach((detail) => {
                if (detail.startsWith("[Recommendation]")) {
                    const recommendation = detail.replace("[Recommendation]", "").trim();
                    db.query('INSERT INTO header_recommendations (table_info_id, recommendation) VALUES (?, ?)',
                        [result.insertId, recommendation], (err, result) => {
                            if (err) {
                                console.error("header_recommendations tablosuna veri eklenirken hata oluştu:", err);
                                throw err;
                            }
                            console.log(`header_recommendations tablosuna ID: ${result.insertId} ile veri eklendi`);
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
                            console.error("xss_details tablosuna veri eklenirken hata oluştu:", err);
                            throw err;
                        }
                        console.log(`xss_details tablosuna ID: ${result.insertId} ile veri eklendi`);
                    });
            }
        });
});

db.end((err) => {
    if (err) {
        console.error('MySQL bağlantısı kapatılırken hata oluştu:', err);
        throw err;
    }
    console.log('MySQL veritabanı bağlantısı kapatıldı.');
});
