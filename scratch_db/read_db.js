const { Level } = require('level');
async function run() {
  const db = new Level('.', { valueEncoding: 'json' });
  await db.open();
  for await (const [key, value] of db.iterator()) {
    if (key.includes('forge_') || key.includes('3derp_')) {
      console.log('--- KEY:', key);
      console.log(value);
    }
  }
}
run();
