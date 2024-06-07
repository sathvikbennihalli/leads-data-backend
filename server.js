import path from "path";
import express from "express";
import cors from "cors";
import root from "./routes/root.js";
import upload from "./routes/upload.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createSheetHashesTable, pool } from "./config/database.js";
import crypto from "crypto";

// Load environment variables from .env file
dotenv.config();

// Get current file and directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Define allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://4f458e3d.leads-data-frontend.pages.dev",
  "https://leads-data-frontend.pages.dev",
];

// Setup CORS middleware with custom options
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc.) or if origin is allowed
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use("/", express.static(path.join(__dirname, "public")));

// Setup routes
app.use("/", root);
app.use("/", upload);

// Catch-all route for 404 errors
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// Ensure 'sheet_hashes' table is created at startup
createSheetHashesTable()
  .then(() => {
    console.log("Checked and created 'sheet_hashes' table if it didn't exist.");

    // Start the server after ensuring the table is created
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize 'sheet_hashes' table:", error);
  });
