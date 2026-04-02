const express = require("express");
const app = express();
const cors = require('cors');

const PORT = process.env.PORT || 5000;

require("./Connection/Conn");
const UserRoutes = require("./Routes/UserRoutes.js");
const TeacherRoutes = require("./Routes/TeacherRoutes.js");
const AdminRoutes = require("./Routes/AdminRoutes.js");
const AssignmentRoutes = require("./Routes/AssignmentRoutes.js");
const SubmittedRoutes = require("./Routes/SubmittedRoutes.js");
const FeedbackRoutes = require("./Routes/FeedbackRoutes.js");

const corsOptions = {
    origin: "http://localhost:8080",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/user", UserRoutes);
app.use("/teacher",TeacherRoutes);
app.use("/admin",AdminRoutes);
app.use("/assignment", AssignmentRoutes);
app.use("/submitted", SubmittedRoutes);
app.use("/feedback", FeedbackRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});