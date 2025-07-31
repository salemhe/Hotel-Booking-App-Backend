import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import configurePassport from "./api/config/passport.js"; 
import path from "path";
import { fileURLToPath } from "url";


configurePassport(passport);

// Support __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config();

// Import routes
import userRoutes from "./api/routes/userRoutes.js";
import vendorRoutes from "./api/routes/vendorRoutes.js";
import sessionRoutes from "./api/routes/sessionRoutes.js";
import adminRoutes from "./api/routes/adminRoutes.js";
import restaurantRoutes from "./api/routes/restaurantRoutes.js";
import authRoutes from "./api/routes/authRoutes.js";
// Import new routes
import superAdminRoutes from "./api/routes/superAdminRoutes.js";
import hotelRoutes from "./api/routes/hotelRoutes.js";
import reservationRoutes from "./api/routes/reservationRoutes.js";
import locationRoutes from "./api/routes/locationRoutes.js";
import chainRoutes from "./api/routes/chainRoutes.js";
import dashboardRoutes from "./api/routes/dashboardRoutes.js";

// Initialize app and server
const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// CORS must be the very first middleware
const allowedOrigins = [
  "https://hotel-booking-application-omega.vercel.app",
  // add other allowed origins if needed
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-api-secret"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Parse cookies and JSON before any routes
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session configuration with memory store (no MongoDB dependency)
const sessionConfig = {
  secret: process.env.JWT_SECRET || "your-session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days in milliseconds
  }
};

console.log("Using memory-based session store for development");
app.use(session(sessionConfig));

// Passport
app.use(passport.initialize());
app.use(passport.session());


// Debug endpoint to check CORS config in production
app.get('/cors-debug', (req, res) => {
  res.json({
    env: process.env.NODE_ENV,
    allowedOrigins: [
      'http://localhost:3000',
      'https://hotel-booking-application-omega.vercel.app'
    ],
    originHeader: req.headers.origin
  });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/restaurant", restaurantRoutes); // ✅ restaurant route registered once
app.use("/api/auth", authRoutes);

// New routes
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/chains", chainRoutes);
app.use("/api", dashboardRoutes);

// Socket.IO
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// MongoDB connection - disabled for development without database
// To enable MongoDB, ensure MongoDB is running and set MONGO_URI environment variable
console.log("MongoDB connection disabled for development");
console.log("To enable database features:");
console.log("1. Install and start MongoDB locally");
console.log("2. Or set MONGO_URI to a cloud MongoDB connection string");
console.log("3. Uncomment the MongoDB connection code in server.js");

// Uncomment below when MongoDB is available:
/*
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected successfully");
      const collections = ["bookings", "menus", "users", "vendors", "hotels", "reservations", "locations", "chains"];
      collections.forEach((collection) => {
        mongoose.connection.db
          .collection(collection)
          .watch()
          .on("change", (change) => {
            io.emit(`${collection}Update`, {
              type: change.operationType,
              data: change.fullDocument,
            });
          });
      });
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
      console.warn("Application will continue without MongoDB. Some features may not work properly.");
    });
} else {
  console.warn("MONGO_URI not configured. Application will run without database connection.");
  console.warn("Please set MONGO_URI environment variable to enable database features.");
}
*/

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
