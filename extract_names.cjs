const fs = require('fs');
const path = require('path');
const lsPath = path.join(process.env.APPDATA, 'react-example', 'Local Storage', 'leveldb');
const files = fs.readdirSync(lsPath).filter(f => f.endsWith('.ldb') || f.endsWith('.log'));
let allData = '';
files.forEach(f => {
  try {
    allData += fs.readFileSync(path.join(lsPath, f), 'latin1').replace(/\x00/g, '');
  } catch(e){}
});
const matches = allData.match(/\"name\":\"[^\"]+\"/g);
if(matches) {
  const unique = [...new Set(matches)];
  console.log('Found names:', unique.join(', '));
}
