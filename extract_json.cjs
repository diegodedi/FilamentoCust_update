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

const prods = jsons.filter(arr => arr.some(x => x.name === 'Cubo Teste' && (x.weight || x.parts)));
const mats = jsons.filter(arr => arr.some(x => x.name === 'PLA Velvet'));

if (prods.length > 0) {
  fs.writeFileSync('extracted_final_products.json', JSON.stringify(prods.sort((a,b)=>b.length-a.length)[0], null, 2));
  console.log('Products found and saved to extracted_final_products.json');
} else {
  console.log('No products array found containing Cubo Teste.');
}

if (mats.length > 0) {
  fs.writeFileSync('extracted_final_materials.json', JSON.stringify(mats.sort((a,b)=>b.length-a.length)[0], null, 2));
  console.log('Materials found and saved to extracted_final_materials.json');
} else {
  console.log('No materials array found containing PLA Velvet.');
}
