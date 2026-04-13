const app = require("express");
const AdminRoutes = app.Router();

const { login, signup, getStats, getUsers, deleteUser } = require("../Middleware/AdminMiddleware");
AdminRoutes.post("/signup", signup);
AdminRoutes.post("/login", login);
AdminRoutes.get("/stats", getStats);
AdminRoutes.get("/users", getUsers);
AdminRoutes.delete("/users/:model/:id", deleteUser);

module.exports = AdminRoutes;
