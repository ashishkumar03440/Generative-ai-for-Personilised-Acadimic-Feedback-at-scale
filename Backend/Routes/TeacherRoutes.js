const app = require("express");
const TeacherRoutes = app.Router();

const {login, signup} = require("../Middleware/TeacherMiddleware");
TeacherRoutes.post("/signup",signup);
TeacherRoutes.post("/login",login);
module.exports = TeacherRoutes;
