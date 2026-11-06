import fs from 'fs';

const content = fs.readFileSync('public/assets/logos/all_logos.svg', 'utf8');
console.log('all_logos.svg size:', content.length);
// Find text or paths
const lines = content.split('\n');
console.log('total lines:', lines.length);
// Search for blue paths
let count = 0;
lines.forEach((l, i) => {
  if (l.includes('0,140,255') || l.includes('016BB7')) {
    if (count < 5) console.log(`Line ${i+1}:`, l.slice(0, 150));
    count++;
  }
});
console.log('Total blue lines in all_logos.svg:', count);
