const express = require("express");
const app = express();
const cors = require('cors');

const PORT = 5000;

require("./Connection/Conn");
const UserRoutes = require("./Routes/UserRoutes.js");
const TeacherRoutes = require("./Routes/TeacherRoutes.js");
const AdminRoutes = require("./Routes/AdminRoutes.js");
const AssignmentRoutes = require("./Routes/AssignmentRoutes.js");

app.use(cors({
    origin: "http://localhost:8080",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

// Serve uploads folder statically so frontend can access raw file URLs if needed
app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/user", UserRoutes);
app.use("/teacher",TeacherRoutes);
app.use("/admin",AdminRoutes);
app.use("/assignment", AssignmentRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});