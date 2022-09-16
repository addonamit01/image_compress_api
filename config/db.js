const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config();

const db_connection = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
});

db_connection.connect((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("MYSQL Connected...");
    }
})

module.exports = db_connection;