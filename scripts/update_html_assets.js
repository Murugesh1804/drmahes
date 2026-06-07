const fs = require('fs');
const path = require('path');

const websiteDir = path.join(__dirname, '../website');
const files = fs.readdirSync(websiteDir);

const htmlFiles = files.filter(file => path.extname(file).toLowerCase() === '.html');

htmlFiles.forEach(file => {
  const filePath = path.join(websiteDir, file);
  console.log(`Processing ${file}...`);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Replace style.css with style.min.css
  content = content.replace(/assets\/style\.css/g, 'assets/style.min.css');

  // 2. Replace logo_white.png/webp with assets/logo_white.webp and width/height dimensions
  content = content.replace(/<img\s+src="assets\/logo_white\.(png|webp)"([^>]*?)>/gi, (match, ext, rest) => {
    // Clean any existing width/height from rest to prevent duplicates (just in case)
    let cleanRest = rest.replace(/\s*(width|height)="[^"]*"/gi, '');
    return `<img src="assets/logo_white.webp" width="927" height="269"${cleanRest}>`;
  });

  // 3. Replace logo_black.png/webp with assets/logo_black.webp and width/height dimensions
  content = content.replace(/<img\s+src="assets\/logo_black\.(png|webp)"([^>]*?)>/gi, (match, ext, rest) => {
    let cleanRest = rest.replace(/\s*(width|height)="[^"]*"/gi, '');
    return `<img src="assets/logo_black.webp" width="848" height="294"${cleanRest}>`;
  });

  // 4. Update reception_area.webp with width/height
  content = content.replace(/<img\s+src="assets\/reception_area\.webp"([^>]*?)>/gi, (match, rest) => {
    let cleanRest = rest.replace(/\s*(width|height)="[^"]*"/gi, '');
    return `<img src="assets/reception_area.webp" width="1024" height="1024"${cleanRest}>`;
  });

  // 5. Update dr.mahe.webp with width/height
  content = content.replace(/<img\s+src="assets\/dr\.mahe\.webp"([^>]*?)>/gi, (match, rest) => {
    let cleanRest = rest.replace(/\s*(width|height)="[^"]*"/gi, '');
    return `<img src="assets/dr.mahe.webp" width="1684" height="2528"${cleanRest}>`;
  });

  // 6. Update Unsplash card images (700x420)
  content = content.replace(/<img\s+src="https:\/\/images\.unsplash\.com\/photo-([^?"]+)\?w=700&h=420([^"]*?)"([^>]*?)>/gi, (match, photoId, params, rest) => {
    let cleanRest = rest.replace(/\s*(width|height)="[^"]*"/gi, '');
    return `<img src="https://images.unsplash.com/photo-${photoId}?w=700&h=420${params}" width="700" height="420"${cleanRest}>`;
  });

  // 7. Update Unsplash detail images (700x500)
  content = content.replace(/<img\s+src="https:\/\/images\.unsplash\.com\/photo-([^?"]+)\?w=700&h=500([^"]*?)"([^>]*?)>/gi, (match, photoId, params, rest) => {
    let cleanRest = rest.replace(/\s*(width|height)="[^"]*"/gi, '');
    return `<img src="https://images.unsplash.com/photo-${photoId}?w=700&h=500${params}" width="700" height="500"${cleanRest}>`;
  });

  // 8. Update index.html dynamic script template
  if (file === 'index.html') {
    content = content.replace(
      `<img src="\${tx.img}" alt="\${tx.name} — Dr. Mahe's Dentistry" loading="lazy" onerror`,
      `<img src="\${tx.img}" alt="\${tx.name} — Dr. Mahe's Dentistry" loading="lazy" width="700" height="420" onerror`
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Done processing HTML files!');
