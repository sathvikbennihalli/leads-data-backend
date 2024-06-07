import express from "express";
import { createTablesAndInsertData } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/upload", createTablesAndInsertData);

export default router;
