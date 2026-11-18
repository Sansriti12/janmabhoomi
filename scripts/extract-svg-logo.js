const fs = require('fs');
const zlib = require('zlib');

const pdfPath = 'C:/Users/NISHANT/.gemini/antigravity/brain/6a2a028b-ef6d-4aac-b7b8-88e28d1d2a91/.user_uploaded/media_1794981896035_279302ef.pdf';
const pdf = fs.readFileSync(pdfPath);
const streamStart = pdf.indexOf('stream\r\n') !== -1 ? pdf.indexOf('stream\r\n') + 8 : pdf.indexOf('stream\n') + 7;
const streamEnd = pdf.indexOf('endstream');
const streamData = pdf.slice(streamStart, streamEnd);
const decompressed = zlib.inflateSync(streamData).toString('utf8');

const tokens = decompressed.trim().split(/\s+/);
let currentColor = '#000000';
let pathD = '';
let svgPaths = [];

function cmykToRgb(c, m, y, k) {
  if (c >= 0.9 && m >= 0.4) return '#016BB7'; // Authentic Janmabhoomi Heritage Blue
  const r = Math.round(255 * (1 - c) * (1 - k));
  const g = Math.round(255 * (1 - m) * (1 - k));
  const b = Math.round(255 * (1 - y) * (1 - k));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
let stack = [];

for (let i = 0; i < tokens.length; i++) {
  const t = tokens[i];
  if (!isNaN(parseFloat(t))) {
    stack.push(parseFloat(t));
  } else {
    if (t === 'k') {
      const k = stack.pop(), y = stack.pop(), m = stack.pop(), c = stack.pop();
      currentColor = cmykToRgb(c, m, y, k);
    } else if (t === 'g') {
      const g = stack.pop();
      const v = Math.round(g * 255).toString(16).padStart(2, '0');
      currentColor = '#' + v + v + v;
    } else if (t === 'rg') {
      const b = Math.round(stack.pop() * 255), g = Math.round(stack.pop() * 255), r = Math.round(stack.pop() * 255);
      currentColor = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    } else if (t === 'm') {
      const y = stack.pop(), x = stack.pop();
      const sy = 180 - y;
      pathD += `M ${x.toFixed(2)} ${sy.toFixed(2)} `;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
    } else if (t === 'l') {
      const y = stack.pop(), x = stack.pop();
      const sy = 180 - y;
      pathD += `L ${x.toFixed(2)} ${sy.toFixed(2)} `;
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, sy); maxY = Math.max(maxY, sy);
    } else if (t === 'c') {
      const y3 = stack.pop(), x3 = stack.pop(), y2 = stack.pop(), x2 = stack.pop(), y1 = stack.pop(), x1 = stack.pop();
      const sy1 = 180 - y1, sy2 = 180 - y2, sy3 = 180 - y3;
      pathD += `C ${x1.toFixed(2)} ${sy1.toFixed(2)} ${x2.toFixed(2)} ${sy2.toFixed(2)} ${x3.toFixed(2)} ${sy3.toFixed(2)} `;
      minX = Math.min(minX, x1, x2, x3); maxX = Math.max(maxX, x1, x2, x3);
      minY = Math.min(minY, sy1, sy2, sy3); maxY = Math.max(maxY, sy1, sy2, sy3);
    } else if (t === 'h') {
      pathD += 'Z ';
    } else if (t === 'f' || t === 'f*' || t === 'B' || t === 'B*') {
      if (pathD.trim()) {
        svgPaths.push({ d: pathD.trim(), color: currentColor });
        pathD = '';
      }
    } else if (t === 'n') {
      pathD = '';
    }
    stack = [];
  }
}

// Bounding box padding
const pad = 2;
const viewBoxX = (minX - pad).toFixed(2);
const viewBoxY = (minY - pad).toFixed(2);
const viewBoxW = (maxX - minX + pad * 2).toFixed(2);
const viewBoxH = (maxY - minY + pad * 2).toFixed(2);

const svgLines = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBoxX} ${viewBoxY} ${viewBoxW} ${viewBoxH}" width="${viewBoxW}" height="${viewBoxH}">`,
  ...svgPaths.map(p => `  <path d="${p.d}" fill="${p.color}" fill-rule="evenodd" />`),
  `</svg>`
];

fs.writeFileSync('public/assets/logos/janmabhoomi-full-logo.svg', svgLines.join('\n'), 'utf8');
console.log('Successfully created public/assets/logos/janmabhoomi-full-logo.svg!');
console.log(`ViewBox: ${viewBoxX} ${viewBoxY} ${viewBoxW} ${viewBoxH}`);
