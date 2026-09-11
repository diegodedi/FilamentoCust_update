const { Level } = require('level');
const fs = require('fs');

async function run() {
  const db = new Level('.', { valueEncoding: 'buffer', keyEncoding: 'buffer' });
  await db.open();
  const obj = {};
  for await (const [keyBuf, valueBuf] of db.iterator()) {
    const key = keyBuf.toString('utf8');
    // LocalStorage keys have prefixes like _file://\x00\x01
    // Let's check if '3derp_' is in the key string
    if (key.includes('3derp_')) {
      let keyName = key.substring(key.indexOf('3derp_'));
      // The value is UTF-16LE, so we can convert it by stripping null bytes, 
      // or actually it has a length prefix. Let's see what the string looks like:
      // A standard UTF-16LE string has a varint length prefix if it's Chrome LevelDB format.
      // We can just strip non-printable characters for now and try to parse JSON!
      let valStr = valueBuf.toString('utf8').replace(/[\x00-\x1F\x7F]/g, '');
      console.log('KEY:', keyName);
      
      // Since it's a Chrome LocalStorage value, the actual format is:
      // [1 byte indicating type?][length varint][utf-16le bytes]
      // Let's try converting buffer directly skipping the first few bytes.
      // Let's just output the first 100 bytes as string.
      console.log('VALUE:', valStr.substring(0, 500));
      obj[keyName] = valStr;
    }
  }
  
  // also write everything to a file to inspect
  fs.writeFileSync('dump.json', JSON.stringify(obj, null, 2));
}
run();
