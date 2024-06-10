import { google } from "googleapis";

async function getAllColumnValues(auth, spreadsheetId, sheetTitle) {
  const sheets = google.sheets({ version: "v4", auth: auth });

  try {
    const spreadsheetResponse = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });
    const sheetList = spreadsheetResponse.data.sheets;
    const allColumns = [];

    // const sheetTitle = sheetList[sheetList.length - 1].properties.title;
    const range = `${sheetTitle}!C2:ZZ`;
    const valuesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,

      range: range,
    });

    if (valuesResponse.data.values) {
      const rows = valuesResponse.data.values;

      const numColumns = rows[0].length;
      const columns = Array.from({ length: numColumns }, () => []);

      rows.forEach((row) => {
        row.forEach((value, columnIndex) => {
          columns[columnIndex].push(parseFloat(value));
        });
      });

      columns.forEach((column, i) => {
        let sum = 0;
        for (let i = 0; i < column.length; i++) {
          sum = sum + column[i];
        }

        const average = sum / column.length;

        allColumns.push(average.toFixed(1));
      });
    }

    return allColumns;
  } catch (err) {
    console.error("Error getting all column values:", err);
    throw err;
  }
}

export default getAllColumnValues;
