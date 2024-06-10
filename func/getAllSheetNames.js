import { google } from "googleapis";

async function getAllSheetNames(auth, spreadsheetId) {
  const sheets = google.sheets({ version: "v4", auth: auth });

  try {
    const spreadsheetResponse = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });
    const sheetList = spreadsheetResponse.data.sheets;
    const allSheetTitle = [];

    sheetList.forEach((sheet) => allSheetTitle.push(sheet.properties.title));

    return allSheetTitle;
  } catch (err) {
    console.error("Error getting all column values:", err);
    throw err;
  }
}

export default getAllSheetNames;
