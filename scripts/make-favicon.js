const fs = require('fs');

const svgContent = fs.readFileSync('public/assets/logos/janmabhoomi-logo.svg', 'utf8');
const lines = svgContent.split('\n');

// The main logo path is line 3 (index 2)
const logoPath = lines[2];
const jaIndex = logoPath.indexOf('M 463.921');
const jaSubpath = logoPath.substring(jaIndex).split('"')[0];

const nums = jaSubpath.match(/-?\d+\.?\d*/g).map(Number);
let minX = 9999, maxX = -9999, minY = 9999, maxY = -9999;
for (let i = 0; i < nums.length; i += 2) {
  const x = nums[i];
  const y = nums[i+1];
  if (x !== undefined && !isNaN(x)) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
  }
  if (y !== undefined && !isNaN(y)) {
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
}

console.log('Bounds:', { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY });

// Let's create an authentic brand favicon SVG:
// A rounded squircle (#016BB7) with the official white "જ" vector
const targetSize = 64;
const padding = 8;
const drawSize = targetSize - padding * 2; // 48
const scale = Math.min(drawSize / (maxX - minX), drawSize / (maxY - minY));
const offsetX = padding + (drawSize - (maxX - minX) * scale) / 2 - minX * scale;
const offsetY = padding + (drawSize - (maxY - minY) * scale) / 2 - minY * scale;

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="jb-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0178CD"/>
      <stop offset="100%" stop-color="#015A99"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#jb-grad)"/>
  <rect x="1.5" y="1.5" width="61" height="61" rx="12.5" fill="none" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="1.5"/>
  <g transform="translate(${offsetX.toFixed(2)}, ${offsetY.toFixed(2)}) scale(${scale.toFixed(4)})">
    <path d="${jaSubpath}" fill="#FFFFFF" fill-rule="evenodd" stroke="none"/>
  </g>
</svg>
`;

fs.writeFileSync('public/favicon.svg', faviconSvg, 'utf8');
fs.writeFileSync('src/app/icon.svg', faviconSvg, 'utf8');
console.log('Successfully wrote public/favicon.svg and src/app/icon.svg');
