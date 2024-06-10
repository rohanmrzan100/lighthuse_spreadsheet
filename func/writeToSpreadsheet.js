import { google } from "googleapis";

async function addSheet(auth, spreadsheetId, tabName, titleRow, data) {
  const sheets = google.sheets({
    version: "v4",
    auth: auth,
  });

  const response = await sheets.spreadsheets.get({
    spreadsheetId: spreadsheetId,
  });

  const existingSheets = response.data.sheets;
  let sheetExists = false;
  let existingSheetId = null;

  // Check if the sheet already exists and get its ID if it does
  for (const sheet of existingSheets) {
    if (sheet.properties.title === tabName) {
      sheetExists = true;
      existingSheetId = sheet.properties.sheetId;
      break;
    }
  }

  // If the sheet exists, delete it
  if (sheetExists && existingSheetId !== null) {
    await deleteSheet(auth, spreadsheetId, existingSheetId);
  }

  try {
    // Add the new sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [{ addSheet: { properties: { title: tabName } } }],
      },
    });

    // Append the title row
    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: tabName,
      valueInputOption: "RAW",
      resource: {
        values: [titleRow],
      },
    });

    // Get the new sheet's ID
    const newResponse = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });
    const newSheets = newResponse.data.sheets;
    let sheetId = "";
    for (const sheet of newSheets) {
      if (sheet.properties.title === tabName) {
        sheetId = sheet.properties.sheetId;
        break;
      }
    }

    // Update the formatting of the title row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 207 / 255,
                    green: 226 / 255,
                    blue: 243 / 255,
                  },
                  textFormat: { bold: true },
                },
              },
              fields:
                "userEnteredFormat.backgroundColor, userEnteredFormat.textFormat.bold",
            },
          },
        ],
      },
    });

    // Append the data
    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: `${tabName}!A2`,
      valueInputOption: "RAW",
      resource: {
        values: data,
      },
    });
  } catch (err) {
    console.log("Sheets API Error: " + err);
  }
}

async function deleteSheet(auth, spreadsheetId, sheetId) {
  const sheets = google.sheets({
    version: "v4",
    auth: auth,
  });
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [
          {
            deleteSheet: {
              sheetId: sheetId,
            },
          },
        ],
      },
    });
    console.log("Sheet deleted successfully.");
  } catch (err) {
    console.error("Error deleting sheet:", err);
  }
}

export default addSheet;
