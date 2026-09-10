import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.GH_TOKEN;
const repo = 'diegodedi/FilamentoCust_update';
const tag = 'v1.0.13';
const fileName = 'Filamento-Cust-Setup-1.0.13.exe';
const filePath = './dist_app/Filamento Cust Setup 1.0.13.exe';

async function upload() {
  console.log(`Getting release ${tag}...`);
  const res = await fetch(`https://api.github.com/repos/${repo}/releases/tags/${tag}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Failed to get release: ${res.statusText}`);
  const release = await res.json();
  const releaseId = release.id;
  console.log(`Release ID: ${releaseId}`);

  const existingAsset = release.assets.find(a => a.name === fileName);
  if (existingAsset) {
    console.log(`Deleting existing ${fileName}...`);
    const delRes = await fetch(existingAsset.url, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!delRes.ok) throw new Error(`Failed to delete existing asset: ${delRes.statusText}`);
  }

  const fileData = fs.readFileSync(filePath);

  console.log(`Uploading ${fileName} (${fileData.length} bytes)...`);
  const uploadUrl = `https://uploads.github.com/repos/${repo}/releases/${releaseId}/assets?name=${fileName}`;
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
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
