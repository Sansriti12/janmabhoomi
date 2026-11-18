const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = 'C:/Users/NISHANT/.gemini/antigravity/brain/6a2a028b-ef6d-4aac-b7b8-88e28d1d2a91/.user_uploaded/media_1794987707521_ce71481e.jpg';

async function processCircle() {
  // Crop the 308x307 circle region from user uploaded image
  const cropBox = { left: 125, top: 382, width: 308, height: 307 };
  
  // Create an SVG circle mask of exactly 308x307
  const maskSvg = Buffer.from(`
    <svg width="308" height="307">
      <circle cx="154" cy="153.5" r="153" fill="white"/>
    </svg>
  `);

  const croppedCircle = await sharp(inputPath)
    .extract(cropBox)
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // Save 512x512 master circle icon
  await sharp(croppedCircle)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '../public/assets/logos/janmabhoomi-circle-logo.png'));

  // Save src/app/icon.png (Next.js App Router default tab icon)
  await sharp(croppedCircle)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '../src/app/icon.png'));

  // Save public/apple-touch-icon.png
  await sharp(croppedCircle)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));

  // Save public/favicon.png
  await sharp(croppedCircle)
    .resize(64, 64, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(__dirname, '../public/favicon.png'));

  // Also generate 32x32 and 16x16 PNG buffers for ICO
  const png32 = await sharp(croppedCircle).resize(32, 32).png().toBuffer();
  const png16 = await sharp(croppedCircle).resize(16, 16).png().toBuffer();
  const png48 = await sharp(croppedCircle).resize(48, 48).png().toBuffer();

  function createIco(images) {
    const numImages = images.length;
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(numImages, 4);

    let offset = 6 + numImages * 16;
    const entries = [];
    const imageBuffers = [];

    for (const img of images) {
      const entry = Buffer.alloc(16);
      entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
      entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
      entry.writeUInt8(0, 2);
      entry.writeUInt8(0, 3);
      entry.writeUInt16LE(1, 4);
      entry.writeUInt16LE(32, 6);
      entry.writeUInt32LE(img.buffer.length, 8);
      entry.writeUInt32LE(offset, 12);

      entries.push(entry);
      imageBuffers.push(img.buffer);
      offset += img.buffer.length;
    }

    return Buffer.concat([header, ...entries, ...imageBuffers]);
  }

  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 },
  ]);

  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), icoBuffer);

  // Generate SVG Circle Favicons
  const fullSvg = fs.readFileSync(path.join(__dirname, '../public/assets/logos/janmabhoomi-full-logo.svg'), 'utf8');
  const innerPaths = fullSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');

  const circleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <circle cx="256" cy="256" r="256" fill="#FFFFFF"/>
  <g transform="translate(36, 211) scale(0.61)">
    <g transform="translate(-17.38, -13.88)">
${innerPaths}
    </g>
  </g>
</svg>`;

  fs.writeFileSync(path.join(__dirname, '../src/app/icon.svg'), circleSvg);
  fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), circleSvg);

  console.log('Circle favicon and app icons successfully written!');
}

processCircle().catch(console.error);
