import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.GH_TOKEN;
const repo = 'diegodedi/FilamentoCust_update';
const tag = 'v1.0.13';
const fileName = 'latest.yml';
const filePath = './dist_app/latest.yml';

async function upload() {
  // 1. Get release ID
  console.log(`Getting release ${tag}...`);
  const res = await fetch(`https://api.github.com/repos/${repo}/releases/tags/${tag}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Failed to get release: ${res.statusText}`);
  const release = await res.json();
  const releaseId = release.id;
  console.log(`Release ID: ${releaseId}`);

  // Check if asset already exists and delete it
  const existingAsset = release.assets.find(a => a.name === fileName);
  if (existingAsset) {
    console.log('Deleting existing latest.yml...');
    const delRes = await fetch(existingAsset.url, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!delRes.ok) throw new Error(`Failed to delete existing asset: ${delRes.statusText}`);
  }

  // 2. Read file
  const fileData = fs.readFileSync(filePath);

  // 3. Upload asset
  console.log('Uploading latest.yml...');
  const uploadUrl = `https://uploads.github.com/repos/${repo}/releases/${releaseId}/assets?name=${fileName}`;
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-yaml',
      'Content-Length': fileData.length
    },
    body: fileData
  });
  
  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Failed to upload: ${uploadRes.statusText} - ${err}`);
  }
  
  console.log('Uploaded successfully!');
}

upload().catch(console.error);
