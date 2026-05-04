const app = require("express");
const AdminRoutes = app.Router();

const { login, signup, getStats, getUsers, deleteUser } = require("../Middleware/AdminMiddleware");
const { verifyAccessToken, requireRole } = require("../Middleware/Auth");

// Public — admins log in here
AdminRoutes.post("/signup", signup);
AdminRoutes.post("/login",  login);

// Protected — must be a verified admin
AdminRoutes.get("/stats",               verifyAccessToken, requireRole("admin"), getStats);
AdminRoutes.get("/users",               verifyAccessToken, requireRole("admin"), getUsers);
AdminRoutes.delete("/users/:model/:id", verifyAccessToken, requireRole("admin"), deleteUser);

module.exports = AdminRoutes;
