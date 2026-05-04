const mongoose = require("mongoose");
const uri = process.env.MONGO_URI || "mongodb://localhost:27017/myDatabase";

mongoose.connect(uri).then(() => {
    console.log("✅ Connected to MongoDB");
}).catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
});
