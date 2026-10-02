// Inlines krishna-mascot.svg into preview.template.html -> preview.html (open preview.html in a browser).
const fs = require('fs');
const svg = fs.readFileSync(__dirname + '/krishna-mascot.svg', 'utf8').replace(/<\?xml[^>]*>\s*/, '');
const tpl = fs.readFileSync(__dirname + '/preview.template.html', 'utf8');
fs.writeFileSync(__dirname + '/preview.html', tpl.replace('<!--SVG-->', svg));
console.log('wrote preview.html');
