const app = require("express");
const AdminRoutes = app.Router();

const {login, signup} = require("../Middleware/AdminMiddleware");
AdminRoutes.post("/signup",signup);
AdminRoutes.post("/login",login);
module.exports = AdminRoutes;
