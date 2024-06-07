import {
  createTable,
  generateInsertQuery,
  insertData,
} from "../models/databaseOperations.js";

export const createTablesAndInsertData = async (req, res) => {
  const { data } = req.body;

  try {
    for (const [sheetName, sheetData] of Object.entries(data)) {
      if (sheetData.length === 0) continue;

      // Create table if it doesn't exist
      const columns = Object.keys(sheetData[0]);
      await createTable(sheetName, columns);

      // Prepare and execute the insert query
      const insertQuery = generateInsertQuery(sheetName, columns);
      const values = sheetData.map(Object.values);
      await insertData(insertQuery, values);
    }
    res.status(200).json({ message: "Data uploaded successfully" });
  } catch (error) {
    console.error("Error uploading data:", error);
    res.status(500).json({ message: "Error uploading data" });
  }
};
