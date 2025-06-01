import fs from 'fs/promises';

const STRAPI_URL = 'http://localhost:1337/api/crousp';
const TOKEN = '00907f0bb07b07079b8953d72dee9a640aa7590e0b9789df186cf552e9a3416752b35f9f0cf0d4a7abe4cdf71d0a77e2753d102ad69503c54fc2f4a4f78c959223601e8a30d0a532f677e5e1ce720e9112a92e209ea868a31f65c63563f31d5415674ad2353c8f2a71257a38090448c5a8e65599c618c4b1a177bc1b032ff1be';

const raw = await fs.readFile('./crous_strapi_ready.json', 'utf-8');
const data = JSON.parse(raw);

for (const resto of data) {
  delete resto.crous_id;
  const res = await fetch(STRAPI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ data: resto })
  });
  const result = await res.json();
  console.log(result);
  await new Promise(r => setTimeout(r, 80));
}
