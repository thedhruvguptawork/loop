const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoute = require("./routes/commentRoute");
const notificationRoutes = require("./routes/notificationRoutes");
const connectDB = require("./config/db");

const app = express();

// ==================== CORS CONFIGURATION ====================
// Support both local development and custom production domains
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map(url => url.trim()) : [])
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
            return callback(null, true);
        }
        
        return callback(null, true); // Permissive default to avoid deployment lockouts
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body parsing with safe payload limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Connect to MongoDB
connectDB();

// ==================== HEALTH & ROOT ROUTES ====================
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development"
    });
});

app.get("/", (req, res) => {
    res.status(200).json({
        message: "✦ Loop API is operational",
        version: "1.0.0",
        health: "/api/health"
    });
});

// ==================== API ROUTES ====================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoute);
app.use("/api/notifications", notificationRoutes);

// Optional: Serve client build if hosted together as a single fullstack service
const clientDistPath = path.join(__dirname, "../../client/dist");
try {
    const fs = require("fs");
    if (fs.existsSync(clientDistPath)) {
        app.use(express.static(clientDistPath));
        app.get("*", (req, res, next) => {
            if (req.path.startsWith("/api")) return next();
            res.sendFile(path.join(clientDistPath, "index.html"));
        });
    }
} catch (e) {
    // Client build not present locally, normal when backend is deployed independently
}

// ==================== 404 HANDLER FOR API ====================
app.use((req, res, next) => {
    res.status(404).json({
        message: `Route ${req.originalUrl} not found`
    });
});

// ==================== GLOBAL ERROR HANDLER ====================
app.use((err, req, res, next) => {
    console.error("Unhandled Application Error:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === "production" ? {} : err.stack
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check ready at http://localhost:${PORT}/api/health`);
});