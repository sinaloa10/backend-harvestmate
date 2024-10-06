const { Pool } = require("pg");

const pool = new Pool({
    host:"localhost",
    port:3002,
    database:"HarvestMate",
    user:"postgres",
    password: "1234"
});
module.exports = { pool };