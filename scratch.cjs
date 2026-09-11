
const https = require('https');
const options = {
  hostname: 'api.github.com',
  path: '/repos/diegodedi/FilamentoCust_update/releases/tags/v1.0.17',
  method: 'GET',
  headers: {
    'Authorization': 'token ' + process.env.GH_TOKEN,
    'User-Agent': 'NodeJS'
  }
};
https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const assets = JSON.parse(data).assets.map(a => a.name);
    console.log('Assets:', assets);
  });
});

