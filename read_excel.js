const xlsx = require('xlsx');

const workbook = xlsx.readFile('List Data Paket dll.xlsx');
const sheetNames = workbook.SheetNames;
console.log('Sheet Names:', sheetNames);

for (const name of sheetNames) {
  const sheet = workbook.Sheets[name];
  const data = xlsx.utils.sheet_to_json(sheet);
  console.log(`\n--- Data in ${name} (first 10 rows) ---`);
  console.log(JSON.stringify(data.slice(0, 10), null, 2));
}
