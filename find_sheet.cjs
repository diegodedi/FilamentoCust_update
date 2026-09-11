const fs = require('fs');
const files = fs.readdirSync('scratch_db');
let data = '';
files.forEach(f => {
  try {
    data += fs.readFileSync('scratch_db/' + f, 'latin1');
  } catch(e){}
});
const match = data.match(/\"spreadsheetId\":\"([^\"]+)\"/);
if (match) console.log('Spreadsheet ID:', match[1]);
else console.log('No spreadsheet ID found');
