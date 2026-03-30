const app = require("express");
const UserRoutes = app.Router();

const {login, signup} = require("../Middleware/UserMiddleware");
UserRoutes.post("/signup",signup);
UserRoutes.post("/login",login);
module.exports = UserRoutes;
