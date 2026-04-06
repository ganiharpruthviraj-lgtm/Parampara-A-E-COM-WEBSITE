const fs = require('fs');
const files = [
  'about.html', 'artisans.html', 'masterpiece.html', 
  'products.html', 'search.html', 'state_categories.html', 'states.html'
];
files.forEach(f => {
    if(!fs.existsSync(f)) return;
    let text = fs.readFileSync(f, 'utf8');
    text = text.replace(/window\.addEventListener\('load'/g, "document.addEventListener('DOMContentLoaded'");
    fs.writeFileSync(f, text);
    console.log('Fixed', f);
});
