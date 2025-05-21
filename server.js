import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import { createServer } from "http";
import { Server } from "socket.io";
import initializePassport from "./api/config/passport.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Import routes
import userRoutes from "./api/routes/userRoutes.js";
import vendorRoutes from "./api/routes/vendorRoutes.js";
import sessionRoutes from "./api/routes/sessionRoutes.js";
import adminRoutes from "./api/routes/adminRoutes.js";

// Initialize Express app
const app = express();
const server = createServer(app); // Create HTTP server
const io = new Server(server, { cors: { origin: "*" } }); // Attach socket.io

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Session Middleware
app.use(
  session({
    secret: "your-session-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
initializePassport(passport);

// API routes
app.use("/api/users", userRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/admin", adminRoutes);

// Socket.io connection
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    // Listen for MongoDB changes (Real-time updates)
    const collections = ["bookings","menus", "users", "vendors"];

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
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT ;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
