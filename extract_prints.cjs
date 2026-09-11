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

function extractJSONs(str) {
  let jsons = [];
  let startIndex = 0;
  while ((startIndex = str.indexOf('[{"', startIndex)) !== -1) {
    let brackets = 0;
    let inString = false;
    let escape = false;
    for (let i = startIndex; i < str.length; i++) {
      const char = str[i];
      if (escape) {
        escape = false;
      } else if (char === '\\') {
        escape = true;
      } else if (char === '"') {
        inString = !inString;
      } else if (!inString) {
        if (char === '[') brackets++;
        else if (char === ']') brackets--;
      }
      
      if (brackets === 0 && !inString) {
        const potentialJson = str.substring(startIndex, i + 1);
        try {
          const parsed = JSON.parse(potentialJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            jsons.push(parsed);
          }
        } catch(e) {}
        break;
      }
    }
    startIndex++;
  }
  return jsons;
}

const jsons = extractJSONs(allData);

// Find print jobs: array containing objects with fileName and printerName and status
const printJobs = jsons.filter(arr => arr.some(x => x.fileName !== undefined && x.status !== undefined && x.printerName !== undefined));

const bestPrintJobs = printJobs.sort((a,b)=>b.length-a.length)[0] || [];

console.log('Found print jobs arrays:', printJobs.length);
console.log('Best print jobs length:', bestPrintJobs.length);

fs.writeFileSync('extracted_prints.json', JSON.stringify(bestPrintJobs, null, 2));
console.log('Done!');
