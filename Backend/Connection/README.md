# 🔌 Connection — MongoDB Database Connection

> **Location:** `Backend/Connection/`  
> **Purpose:** Establishes and maintains the connection to the MongoDB database.

---

## 📁 Folder Contents

```
Connection/
└── Conn.js    # MongoDB connection using Mongoose
```

---

## 📄 `Conn.js`

This is the single file responsible for connecting the backend to MongoDB. It is `require()`'d once in `Index.js`, and Mongoose then manages a persistent connection pool for the entire lifetime of the server process.

### How it works:

```js
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/myDatabase")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));
```

| Step | Detail |
|------|--------|
| **Connection URL** | `mongodb://localhost:27017/myDatabase` — local MongoDB instance |
| **Database name** | `myDatabase` |
| **On success** | Logs `"Connected to MongoDB"` to the console |
| **On failure** | Logs the error object (server continues running, requests to DB will fail gracefully) |

---

## 🔄 Connection Lifecycle

```
Index.js starts
     │
     └──▶ require("./Connection/Conn")
               │
               └──▶ mongoose.connect() called once
                         │
                         ├── Success → Mongoose connection pool ready
                         │            All Models can now query MongoDB
                         │
                         └── Failure → Error logged to console
```

---

## ⚠ Notes

- **No retry logic** is currently implemented. If MongoDB is not running when the server starts, all database operations will fail. For production, consider adding reconnection logic.
- The connection URL is currently **hardcoded**. Consider moving this to the `.env` file as `MONGO_URI` for environment-specific configuration.
- Mongoose automatically reuses the connection — you do **not** need to call `connect()` in individual route handlers or middleware files.

---

## 🔗 Related Files

- `Backend/Index.js` — Imports this file at startup
- `Backend/Models/*.js` — All models use the Mongoose connection established here
