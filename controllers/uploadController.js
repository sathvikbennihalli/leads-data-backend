import {
  createTable,
  generateInsertQuery,
  insertData,
  generateHash,
  hashExists,
  insertHash,
  addMissingColumns,
  fetchExistingRows,
} from "../models/databaseOperations.js";
import { pool } from "../config/database.js";

// Function to check if a table exists
const tableExists = async (tableName) => {
  try {
    const [rows] = await pool.query("SHOW TABLES LIKE ?", [tableName]);
    return rows.length > 0;
  } catch (error) {
    console.error(`Error checking if table '${tableName}' exists:`, error);
    throw error;
  }
};

export const createTablesAndInsertData = async (req, res) => {
  const { data } = req.body;

  try {
    for (const [sheetName, sheetData] of Object.entries(data)) {
      if (sheetData.length === 0) continue;

      // Generate hash for the current sheet data
      const hash = generateHash(sheetData);

      // Check if this hash already exists for this sheet
      if (await hashExists(sheetName, hash)) {
        console.log(
          `Data for sheet '${sheetName}' with hash '${hash}' is already present. Skipping insertion.`
        );
        continue;
      }

      // Check if the table exists
      const exists = await tableExists(sheetName);

      // Determine columns
      let columns = Object.keys(sheetData[0]);
      if (!exists) {
        // Create table if it doesn't exist
        await createTable(sheetName, columns);
      } else {
        // Ensure all necessary columns exist in the table
        await addMissingColumns(sheetName, columns);
      }

      // Fetch existing rows from the table
      const existingRows = await fetchExistingRows(sheetName);

      // Filter out rows that already exist in the table
      const newRows = sheetData.filter((newRow) => {
        // Check if the row already exists in the table
        return !existingRows.some((existingRow) => {
          // Check if all columns' values match
          return columns.every(
            (column) => existingRow[column] === newRow[column]
          );
        });
      });

      if (newRows.length > 0) {
        // Prepare and execute the insert query for new rows
        const insertQuery = generateInsertQuery(sheetName, columns);
        const values = newRows.map((row) =>
          columns.map((col) => row[col] || null)
        );
        await insertData(insertQuery, values);

        // Insert the hash into the sheet_hashes table
        await insertHash(sheetName, hash);
      } else {
        console.log(`No new data to insert for sheet '${sheetName}'.`);
      }
    }
    res.status(200).json({ message: "Data uploaded successfully" });
  } catch (error) {
    console.error("Error uploading data:", error);
    res.status(500).json({ message: "Error uploading data" });
  }
};
