import fs from 'fs';

const files = [
  'public/assets/logos/janmabhoomi-logo.svg',
  'public/assets/logos/janmabhoomi-official-logo.svg',
  'public/assets/logos/all_logos.svg'
];

for (const p of files) {
  if (fs.existsSync(p)) {
    console.log('=== FILE:', p);
    const content = fs.readFileSync(p, 'utf8');
    const fills = content.match(/fill="[^"]+"/g) || [];
    console.log('fills:', Array.from(new Set(fills)));
    const strokes = content.match(/stroke="[^"]+"/g) || [];
    console.log('strokes:', Array.from(new Set(strokes)));
  }
}
