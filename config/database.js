import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create a connection pool to manage connections to the database
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to create the 'sheet_hashes' table if it doesn't exist
const createSheetHashesTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS sheet_hashes (
      sheet_name VARCHAR(255) PRIMARY KEY,
      hash VARCHAR(64)
    );
  `;

  try {
    // Acquire a connection from the pool
    const connection = await pool.getConnection();

    // Execute the table creation query
    await connection.query(createTableQuery);

    console.log("Table 'sheet_hashes' created successfully.");

    // Release the connection back to the pool
    connection.release();
  } catch (error) {
    console.error("Error creating 'sheet_hashes' table:", error);
  }
};

// Export the pool and the createSheetHashesTable function
export { createSheetHashesTable, pool };

// Automatically create the 'sheet_hashes' table when this module is imported
createSheetHashesTable().catch((error) =>
  console.error("Failed to initialize 'sheet_hashes' table:", error)
);
