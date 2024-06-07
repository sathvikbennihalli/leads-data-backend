import { pool } from "../config/database.js";
import crypto from "crypto";

export const createTable = async (tableName, columns) => {
  try {
    const columnDefinitions = columns
      .map((column) =>
        column.includes(" ")
          ? `\`${column}\` VARCHAR(255)`
          : `${column} VARCHAR(255)`
      )
      .join(", ");
    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions})`;
    await pool.query(createTableQuery);
    console.log(`Table '${tableName}' created successfully.`);
  } catch (error) {
    console.error("Error creating table:", error);
  }
};

export const generateInsertQuery = (tableName, columns) => {
  const placeholders = columns.map(() => "?").join(", ");
  const columnNames = columns
    .map((column) => (column.includes(" ") ? `\`${column}\`` : column))
    .join(", ");
  return `INSERT INTO ${tableName} (${columnNames}) VALUES ?`;
};

export const insertData = async (query, values) => {
  try {
    await pool.query(query, [values]);
    console.log("Data inserted successfully.");
  } catch (error) {
    console.error("Error inserting data:", error);
  }
};

// Utility function to generate a hash for the sheet data
const generateHash = (data) => {
  const hash = crypto.createHash("sha256");
  hash.update(JSON.stringify(data));
  return hash.digest("hex");
};

// Check if a hash exists in the database
const hashExists = async (sheetName, hash) => {
  const [rows] = await pool.query(
    "SELECT * FROM sheet_hashes WHERE sheet_name = ? AND hash = ?",
    [sheetName, hash]
  );
  return rows.length > 0;
};

// Insert a new hash into the sheet_hashes table
const insertHash = async (sheetName, hash) => {
  await pool.query(
    "INSERT INTO sheet_hashes (sheet_name, hash) VALUES (?, ?)",
    [sheetName, hash]
  );
};

// Ensure all necessary columns exist in the table
export const addMissingColumns = async (tableName, columns) => {
  try {
    // Fetch existing columns
    const [existingColumns] = await pool.query(
      `SHOW COLUMNS FROM ${tableName}`
    );
    const existingColumnNames = existingColumns.map((col) => col.Field);

    // Identify missing columns
    const missingColumns = columns.filter(
      (column) => !existingColumnNames.includes(column)
    );

    if (missingColumns.length > 0) {
      // Add missing columns to the table
      const addColumnsQuery = missingColumns
        .map(
          (column) =>
            `ALTER TABLE ${tableName} ADD COLUMN ${
              column.includes(" ")
                ? `\`${column}\` VARCHAR(255)`
                : `${column} VARCHAR(255)`
            }`
        )
        .join("; ");

      await pool.query(addColumnsQuery);
      console.log(
        `Added missing columns to table '${tableName}': ${missingColumns.join(
          ", "
        )}`
      );
    }
  } catch (error) {
    console.error("Error adding missing columns:", error);
  }
};

// Fetch all existing rows from the table
export const fetchExistingRows = async (tableName) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM ${tableName}`);
    return rows;
  } catch (error) {
    console.error("Error fetching existing rows:", error);
    return [];
  }
};

// Export the hash-related functions
export { generateHash, hashExists, insertHash };
