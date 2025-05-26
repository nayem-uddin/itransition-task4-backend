require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./handleDb");
const { verifyUserStatus } = require("./middleware");
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());
app.get("/", async (req, res, next) => {
  try {
    const users = await db.getAllUsers();
    res.status(200).json({ users });
  } catch (err) {
    next(err);
  }
});

app.post("/login", async (req, res, next) => {
  try {
    const { email, password, lastLogin } = req.body;
    const userDetails = await db.authenticate(email, password);
    if (!userDetails) {
      return res
        .status(404)
        .json({ message: "Invalid credentials or user doesn't exist" });
    } else if (userDetails.status === "blocked") {
      return res.status(403).json({ message: "You are blocked" });
    }
    const userInfo = await db.updateLoginTime(lastLogin, email);
    res.status(200).json({ message: "login success" });
  } catch (err) {
    next(err);
  }
});

app.post("/", async (req, res, next) => {
  try {
    await db.registerUser(req.body);
    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Account already exists" });
    }
    next(error);
  }
});

app.put("/", verifyUserStatus, async (req, res, next) => {
  try {
    const { selectedUsers, newStatus } = req.body;
    if (selectedUsers?.length === 0) {
      return res.status(400).json({ message: "Select one or more users" });
    }
    const emails = selectedUsers.map((user) => user.email);
    await db.updateUsers(emails, newStatus);
    const users = await db.getAllUsers();
    res.status(200).json({ users, message: "Request successful" });
  } catch (err) {
    next(err);
  }
});

app.delete("/", verifyUserStatus, async (req, res, next) => {
  try {
    const { selectedUsers } = req.body;
    const emails = selectedUsers.map((user) => user.email);
    await db.deleteUsers(emails);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
