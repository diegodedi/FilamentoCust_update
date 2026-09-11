const fs = require('fs');
const path = require('path');

const lsPath = path.join(process.env.APPDATA, 'react-example', 'Local Storage', 'leveldb');
const files = fs.readdirSync(lsPath).filter(f => f.endsWith('.ldb') || f.endsWith('.log'));

let allData = '';
files.forEach(f => {
  try {
    allData += fs.readFileSync(path.join(lsPath, f), 'latin1');
  } catch(e) {}
});

const productMatches = allData.match(/\[\{[^\]]*?\"printTime\":.*?\}\]/g);
if (productMatches) {
  const sorted = productMatches.sort((a, b) => b.length - a.length);
  fs.writeFileSync('extracted_real_products.json', sorted[0]);
  console.log('Real Products extracted:', sorted[0].length, 'bytes');
} else {
  console.log('No real products found');
}
