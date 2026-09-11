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

// Extract any JSON array that contains 'id":"prod-'
const productMatches = allData.match(/\[\{[^\]]*?\"id\":\"prod-.*?\}\]/g);
if (productMatches) {
  // Sort by length to get the most complete array
  const sorted = productMatches.sort((a, b) => b.length - a.length);
  fs.writeFileSync('extracted_products.json', sorted[0]);
  console.log('Products extracted:', sorted[0].length, 'bytes');
} else {
  console.log('No products found');
}

const materialMatches = allData.match(/\[\{[^\]]*?\"initialWeight\":.*?\}\]/g);
if (materialMatches) {
  const sorted = materialMatches.sort((a, b) => b.length - a.length);
  fs.writeFileSync('extracted_materials.json', sorted[0]);
  console.log('Materials extracted:', sorted[0].length, 'bytes');
} else {
  console.log('No materials found');
}

const jobMatches = allData.match(/\[\{[^\]]*?\"printerId\":.*?\}\]/g);
if (jobMatches) {
  const sorted = jobMatches.sort((a, b) => b.length - a.length);
  fs.writeFileSync('extracted_jobs.json', sorted[0]);
  console.log('Jobs extracted:', sorted[0].length, 'bytes');
} else {
  console.log('No jobs found');
}
