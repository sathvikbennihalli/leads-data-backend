import path from "path";
import express from "express";
import cors from "cors"; // Import cors middleware
import root from "./routes/root.js";
import upload from "./routes/upload.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Define allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://4f458e3d.leads-data-frontend.pages.dev/",
];

// Setup cors middleware with custom options
app.use(
  cors({
    origin: function (origin, callback) {
      // Check if the origin is allowed or not
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

app.use(express.json());

app.use("/", express.static(path.join(__dirname, "public")));
app.use("/", root);
app.use("/", upload);

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

app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
