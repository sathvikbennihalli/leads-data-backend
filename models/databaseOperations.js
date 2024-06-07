import pool from "../config/database.js";

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
