// Builds preview.html: the default pose with every expression's face stacked inside it, so the
// animation code can swap faces instead of swapping whole characters.
//   expressions/<name>.svg  — one Illustrator artboard export per emotion (same pose, same coordinates)
// Run: node build-preview.cjs
const fs = require('fs');
const dir = __dirname + '/expressions/';
const read = (name) => fs.readFileSync(dir + name + '.svg', 'utf8').replace(/<\?xml[^>]*>\s*/, '');

// The full <g id="…">…</g> element, matched by nesting depth
function group(src, id) {
  const start = src.indexOf(`<g id="${id}"`);
  if (start < 0) throw new Error(`no <g id="${id}">`);
  const re = /<g\b|<\/g>/g;
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(src))) {
    if (m[0] === '</g>') { if (--depth === 0) return src.slice(start, m.index + 4); }
    else depth++;
  }
  throw new Error(`unclosed <g id="${id}">`);
}
function path(src, id) {
  const m = src.match(new RegExp(`<path id="${id}"[^>]*/>`));
  if (!m) throw new Error(`no <path id="${id}">`);
  return m[0];
}
// Every expression reuses names like `left-eye`; prefix them so ids stay unique in one document
const prefix = (frag, p) => frag.replace(/\bid="([^"]+)"/g, (_, id) => `id="${p}--${id}"`);

// Crying was drawn on an artboard offset from the others
const OFFSET = { crying: [-3.45, -7.11] };
const EXPRESSIONS = ['laughing', 'amazed', 'disappointed', 'angry', 'crying', 'affectionate'];

let svg = read('default');
const src = Object.fromEntries(EXPRESSIONS.map((n) => [n, read(n)]));

// 1. Faces: default stays as-is (its ids are the animation API), the rest are hidden alternates
const faces = EXPRESSIONS.map((n) => {
  const [dx, dy] = OFFSET[n] || [0, 0];
  const t = dx || dy ? ` transform="translate(${dx} ${dy})"` : '';
  return `<g data-face="${n}" display="none"${t}>${prefix(group(src[n], 'face'), n)}</g>`;
}).join('\n');
const defaultFace = group(svg, 'face');
svg = svg.replace(defaultFace, `<g id="faces"><g data-face="default">${defaultFace}</g>\n${faces}</g>`);

// 2. Raised-fist left arm (Laughing and Crying share it), hidden next to the normal arm
const raised = prefix(group(src.laughing, 'left-arm'), 'raised').replace('id="raised--left-arm"', 'id="arm-raised" display="none"');
const leftArm = group(svg, 'left-arm');
svg = svg.replace(leftArm, leftArm + '\n' + raised);

// 3. Affectionate's floating hearts, on top of everything
const hearts = ['left-heart-top', 'left-heart-bottom', 'right-heart'].map((id) => prefix(path(src.affectionate, id), 'love')).join('');
svg = svg.replace(/<\/svg>\s*$/, `<g id="love-hearts" display="none">${hearts}</g></svg>`);

const tpl = fs.readFileSync(__dirname + '/preview.template.html', 'utf8');
fs.writeFileSync(__dirname + '/preview.html', tpl.replace('<!--SVG-->', svg));
console.log(`wrote preview.html (${(svg.length / 1024).toFixed(0)} KB of SVG)`);
