const xlsx = require('xlsx');
const fs = require('fs');

try {
  const workbook = xlsx.readFile('./List Data Paket dll.xlsx');
  
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    data.forEach(row => {
      console.log(row.join(' | '));
    });
  });
} catch (e) {
  console.error("Error reading excel file:", e);
}
