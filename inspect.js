const xlsx = require('xlsx');

const workbook = xlsx.readFile('C:\\Users\\kdnelson\\Downloads\\All Students.xlsx');
console.log('Sheet Names:', workbook.SheetNames);

const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

console.log('--- Columns ---');
console.log(data[0]);

console.log('--- First 5 rows ---');
for (let i = 1; i < Math.min(data.length, 6); i++) {
  console.log(data[i]);
}
