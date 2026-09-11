const fs = require('fs');
const path = require('path');
const snappy = require('snappy');

const lsPath = path.join(process.env.APPDATA, 'react-example', 'Local Storage', 'leveldb');
const files = fs.readdirSync(lsPath).filter(f => f.endsWith('.ldb') || f.endsWith('.log'));

let allData = [];
files.forEach(f => {
  try {
    allData.push(fs.readFileSync(path.join(lsPath, f)));
  } catch(e){}
});
const data = Buffer.concat(allData);

const target = Buffer.from('3derp_printJobs');

let pos = 0;
while (true) {
  pos = data.indexOf(target, pos);
  if (pos === -1) break;
  
  console.log('Found 3derp_printJobs at pos', pos);
  
  // Try decompressing from here or slightly after
  for (let offset = 15; offset < 40; offset++) {
    for (let len = 10; len < 5000; len++) {
      try {
        const slice = data.slice(pos + offset, pos + offset + len);
        const uncompressed = snappy.uncompressSync(slice);
        const str = uncompressed.toString('utf8');
        if (str.includes('[{"')) {
          console.log(`Success at offset ${offset}, len ${len}!`);
          fs.writeFileSync('extracted_prints_raw.bin', uncompressed);
          const cleanStr = uncompressed.toString('utf16le').replace(/[\x00-\x1F\x7F]/g, '');
          fs.writeFileSync('extracted_prints_clean.txt', cleanStr);
          console.log('Wrote to extracted_prints_clean.txt');
          process.exit(0);
        }
      } catch (e) {
        // ignore
      }
    }
  }
  
  pos += target.length;
}
console.log('Done scanning.');
