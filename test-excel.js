const xlsx = require('xlsx');
const fs = require('fs');

try {
  const workbook = xlsx.readFile('C:\\Users\\kdnelson\\Downloads\\All Students1.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  if (data.length > 0) {
    console.log("Headers:");
    console.log(Object.keys(data[0]));
    console.log("\nFirst 3 rows:");
    console.log(data.slice(0, 3));
  } else {
    console.log("Sheet is empty");
  }
} catch (e) {
  console.error("Error reading file:", e.message);
}
