const fs = require('fs');

const data = require('./all_extracted_data.json');
let initialDataTS = fs.readFileSync('./src/data/initialData.ts', 'utf-8');

// Replace initialProducts
initialDataTS = initialDataTS.replace(
  /export const initialProducts: Product\[\] = \[[\s\S]*?\];\n/,
  `export const initialProducts: Product[] = ${JSON.stringify(data.products, null, 2)};\n`
);

// Replace initialMaterials
initialDataTS = initialDataTS.replace(
  /export const initialMaterials: Material\[\] = \[[\s\S]*?\];\n/,
  `export const initialMaterials: Material[] = ${JSON.stringify(data.materials, null, 2)};\n`
);

// Replace initialInventory
initialDataTS = initialDataTS.replace(
  /export const initialInventory: InventoryItem\[\] = \[[\s\S]*?\];\n/,
  `export const initialInventory: InventoryItem[] = ${JSON.stringify(data.inventory, null, 2)};\n`
);

fs.writeFileSync('./src/data/initialData.ts', initialDataTS);
console.log('Replaced in initialData.ts');
