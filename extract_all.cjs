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

// Categorize them by shape
const products = jsons.filter(arr => arr.some(x => x.name === 'Cubo Teste' && (x.weight || x.parts)));
const materials = jsons.filter(arr => arr.some(x => x.name === 'PLA Velvet'));
const inventory = jsons.filter(arr => arr.some(x => x.name === 'Cubo Teste' && x.stock !== undefined && x.totalValue !== undefined));
const printers = jsons.filter(arr => arr.some(x => x.name === 'Impressora 2' || x.name === 'Creality Hi'));
const printJobs = jsons.filter(arr => arr.some(x => x.productId || x.printerId || x.durationMinutes));

const bestProducts = products.sort((a,b)=>b.length-a.length)[0] || [];
const bestMaterials = materials.sort((a,b)=>b.length-a.length)[0] || [];
const bestInventory = inventory.sort((a,b)=>b.length-a.length)[0] || [];
const bestPrinters = printers.sort((a,b)=>b.length-a.length)[0] || [];
const bestPrintJobs = printJobs.sort((a,b)=>b.length-a.length)[0] || [];

const allExtracted = {
  products: bestProducts,
  materials: bestMaterials,
  inventory: bestInventory,
  printers: bestPrinters,
  printJobs: bestPrintJobs
};

fs.writeFileSync('all_extracted_data.json', JSON.stringify(allExtracted, null, 2));
console.log('Done mapping everything!');
