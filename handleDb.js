require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.db_host,
  port: process.env.db_port,
  user: process.env.db_username,
  password: process.env.db_password,
  database: process.env.db_database,
});

const tableName = process.env.tableName;
async function getAllUsers() {
  const [rows] = await pool.query("SELECT * FROM users");
  return rows;
}

async function getUserByEmail(email) {
  const [rows] = await pool.query(`SELECT * FROM ${tableName} WHERE email=?`, [
    email,
  ]);
  return rows[0];
}

async function authenticate(email, password) {
  const [rows] = await pool.query(
    `SELECT * FROM ${tableName} WHERE email = ? and password=?`,
    [email, password]
  );
  return rows[0];
}

async function updateUsers(emails, status) {
  const placeHolder = createPlaceHolders(emails);
  const [rows] = await pool.query(
    `UPDATE ${tableName} SET status=? WHERE email in (${placeHolder})`,
    [status, ...emails]
  );
  return rows;
}

async function updateLoginTime(time, email) {
  const [rows] = await pool.query(
    `UPDATE ${tableName} SET lastLogin=? WHERE email=?`,
    [time, email]
  );
  return rows;
}

async function registerUser(user) {
  const { firstName, lastName, email, password, status, lastLogin } = user;
  const data = [email, firstName, lastName, status, password, lastLogin];
  const placeHolders = createPlaceHolders(data);
  const [rows] = await pool.query(
    `INSERT INTO ${tableName} VALUES (${placeHolders})`,
    [...data]
  );
  return rows;
}

async function deleteUsers(emails) {
  const placeHolders = createPlaceHolders(emails);
  const [rows] = await pool.query(
    `DELETE FROM ${tableName} WHERE email IN (${placeHolders})`,
    [...emails]
  );
  return rows;
}

function createPlaceHolders(data) {
  return data.map(() => "?").join(", ");
}

module.exports = {
  getAllUsers,
  getUserByEmail,
  authenticate,
  updateUsers,
  updateLoginTime,
  registerUser,
  deleteUsers,
};
