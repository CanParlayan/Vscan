const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./db.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

const sqlCommands = `
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
);

CREATE TABLE table_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_url TEXT,
    timestamp TEXT,
    has_sqli INTEGER,
    has_header INTEGER,
    has_xss INTEGER,
    has_outdated INTEGER,
    user_id INTEGER,  -- Add user_id column
    FOREIGN KEY (user_id) REFERENCES users(id)  -- Reference the user table
);

CREATE TABLE header_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_info_id INTEGER,
    recommendation TEXT,
    header_name TEXT,
    FOREIGN KEY (table_info_id) REFERENCES table_info(id)
);

CREATE TABLE xss_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_info_id INTEGER,
    vulnerability_type TEXT,
    form_action TEXT,
    form_inputs TEXT,
    form_method TEXT,
    FOREIGN KEY (table_info_id) REFERENCES table_info(id)
);
CREATE TABLE sqli_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_info_id INTEGER,
    vulnerability_type TEXT,
    form_action TEXT,
    form_inputs TEXT,
    form_method TEXT,
    FOREIGN KEY (table_info_id) REFERENCES table_info(id)
);

CREATE TABLE outdated_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_info_id INTEGER,
    vulnerability_type TEXT,
    component TEXT,
    version TEXT,
    CVE TEXT,
    up_to_date_version TEXT,  -- Corrected column name
    FOREIGN KEY (table_info_id) REFERENCES table_info(id)
);
`;


db.serialize(() => {
    db.run(
        `CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );`,
        (err) => {
            if (err) throw err;
        }
    );

    db.run(
        `CREATE TABLE table_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      site_url TEXT,
      timestamp TEXT,
      has_sqli INTEGER,
      has_header INTEGER,
      has_xss INTEGER,
      has_outdated INTEGER,
      user_id INTEGER,  -- Add user_id column
      FOREIGN KEY (user_id) REFERENCES users(id)  -- Reference the user table
    );`,
        (err) => {
            if (err) throw err;
        }
    );
    db.run(
        `CREATE TABLE header_recommendations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_info_id INTEGER,
      recommendation TEXT,
      header_name TEXT,
      FOREIGN KEY (table_info_id) REFERENCES table_info(id)
    );`,
        (err) => {
            if (err) throw err;
        }
    );
    db.run(
        `CREATE TABLE xss_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_info_id INTEGER,
      vulnerability_type TEXT,
      form_action TEXT,
      form_inputs TEXT,
      form_method TEXT,
      FOREIGN KEY (table_info_id) REFERENCES table_info(id)
    );`,
        (err) => {
            if (err) throw err;
        }
    );
    db.run(
        `CREATE TABLE sqli_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_info_id INTEGER,
      vulnerability_type TEXT,
      form_action TEXT,
      form_inputs TEXT,
      form_method TEXT,
      FOREIGN KEY (table_info_id) REFERENCES table_info(id)
    );`,
        (err) => {
            if (err) throw err;
        }
    );
    db.run(
        `CREATE TABLE outdated_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_info_id INTEGER,
      vulnerability_type TEXT,
      component TEXT,
      version TEXT,
      CVE TEXT,
      up_to_date_version TEXT,  -- Corrected column name
      FOREIGN KEY (table_info_id) REFERENCES table_info(id)
    );`,
        (err) => {
            if (err) throw err;
        }
    );
}
);

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Close the database connection.');
});