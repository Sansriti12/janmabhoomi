const sharp = require('sharp');
const fs = require('fs');

async function makePlaceholder() {
  if (!fs.existsSync('public/assets/images')) {
    fs.mkdirSync('public/assets/images', { recursive: true });
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
    <rect width="600" height="600" fill="#F8FAFC"/>
    <rect x="30" y="30" width="540" height="540" rx="16" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
    <rect x="80" y="80" width="440" height="40" fill="#016BB7" rx="6"/>
    <text x="300" y="106" font-family="sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">JANMABHOOMI E-PAPER</text>
    <rect x="80" y="150" width="440" height="15" fill="#E2E8F0" rx="3"/>
    <rect x="80" y="180" width="440" height="15" fill="#E2E8F0" rx="3"/>
    <rect x="80" y="210" width="300" height="15" fill="#E2E8F0" rx="3"/>
    <rect x="80" y="260" width="200" height="180" fill="#F1F5F9" rx="6" stroke="#E2E8F0"/>
    <rect x="300" y="260" width="220" height="180" fill="#F1F5F9" rx="6" stroke="#E2E8F0"/>
    <text x="300" y="500" font-family="sans-serif" font-size="16" font-weight="bold" fill="#016BB7" text-anchor="middle">Digital Broadsheet Replica</text>
  </svg>`;
  await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile('public/assets/images/epaper-placeholder.jpg');
  console.log('Created public/assets/images/epaper-placeholder.jpg');
}

makePlaceholder();
