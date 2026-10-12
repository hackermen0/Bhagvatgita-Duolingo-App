// Builds the animated mascot from the Illustrator exports in design/mascot/:
//   krishna-mascot_<Expression>.svg — one artboard per emotion, same pose, same position on the artboard
// Output:
//   src/lib/mascot/krishna-animated.svg  the default pose with every expression's face stacked inside it (and the
//                                        alternate arms and props), so src/lib/mascot/krishna.ts can swap faces
//   design/mascot-svg/preview.html       that SVG + krishna.ts bundled into one page with a button per reaction
// Run: node design/mascot-svg/build-preview.cjs
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const SRC = path.join(__dirname, '../mascot/');
const APP = path.join(__dirname, '../../src/lib/mascot/');
const read = (name) => fs.readFileSync(`${SRC}krishna-mascot_${name}.svg`, 'utf8').replace(/<\?xml[^>]*>\s*/, '');

// prefix used in the combined SVG → Illustrator artboard name
const EXPRESSIONS = {
  laughing: 'Laughing',
  amazed: 'Amazed',
  disappointed: 'Disappointed',
  angry: 'Angry',
  crying: 'Crying',
  affectionate: 'Affectionate',
  shocked: 'Shocked',
  worried: 'Shocked - 2',
  teary: 'Too-Much-Crying'
};

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
function element(src, id) {
  const m = src.match(new RegExp(`<path id="${id}"[^>]*/>`));
  if (!m) throw new Error(`no <path id="${id}">`);
  return m[0];
}
// Every expression reuses names like `left-eye`; prefix them so ids stay unique in one document
const prefix = (frag, p) => frag.replace(/\bid="([^"]+)"/g, (_, id) => `id="${p}--${id}"`);
// Where the ground shadow starts; an artboard that drifted shows up as a difference here
const anchor = (src) => src.match(/id="shadow"[^>]*?d="M([\d.]+),([\d.]+)/).slice(1).map(Number);

let svg = read('Default');
const base = anchor(svg);
const src = Object.fromEntries(Object.entries(EXPRESSIONS).map(([k, file]) => [k, read(file)]));

// 1. Faces: default stays as-is (its ids are the animation API), the rest are hidden alternates
const faces = Object.keys(EXPRESSIONS).map((n) => {
  const [x, y] = anchor(src[n]);
  const [dx, dy] = [base[0] - x, base[1] - y];
  const drifted = Math.hypot(dx, dy) > 0.5;
  if (drifted) console.warn(`! ${EXPRESSIONS[n]} is ${(-dx).toFixed(2)}, ${(-dy).toFixed(2)} px off the Default artboard; corrected`);
  const t = drifted ? ` transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)})"` : '';
  return `<g data-face="${n}" display="none"${t}>${prefix(group(src[n], 'face'), n)}</g>`;
}).join('\n');
const defaultFace = group(svg, 'face');
svg = svg.replace(defaultFace, `<g id="faces"><g data-face="default">${defaultFace}</g>\n${faces}</g>`);

// 2. Alternate left arms, hidden next to the normal one:
//    raised fist (Laughing, Crying) and stiff clenched fist at the side (Shocked, Shocked - 2)
const raised = prefix(group(src.laughing, 'left-arm'), 'raised').replace('id="raised--left-arm"', 'id="arm-raised" display="none"');
const stiff = prefix(group(src.shocked, 'right-arm-2'), 'stiff').replace('id="stiff--right-arm-2"', 'id="arm-stiff" display="none"');
const leftArm = group(svg, 'left-arm');
svg = svg.replace(leftArm, `${leftArm}\n${raised}\n${stiff}`);

// 3. Affectionate's floating hearts, on top of everything
const hearts = ['left-heart-top', 'left-heart-bottom', 'right-heart'].map((id) => prefix(element(src.affectionate, id), 'love')).join('');
svg = svg.replace(/<\/svg>\s*$/, `<g id="love-hearts" display="none">${hearts}</g></svg>`);

fs.mkdirSync(APP, { recursive: true });
fs.writeFileSync(APP + 'krishna-animated.svg', svg);
console.log(`wrote src/lib/mascot/krishna-animated.svg (${(svg.length / 1024).toFixed(0)} KB)`);

// 4. Preview: bundle the app's own krishna.ts (its `?raw` SVG import resolves to the file just written)
esbuild.build({
  entryPoints: [APP + 'krishna.ts'],
  bundle: true,
  write: false,
  format: 'iife',
  globalName: 'Krishna',
  target: 'es2020',
  plugins: [{
    name: 'raw',
    setup(b) {
      b.onResolve({ filter: /\?raw$/ }, (a) => ({ path: path.join(a.resolveDir, a.path.replace(/\?raw$/, '')), namespace: 'raw' }));
      b.onLoad({ filter: /.*/, namespace: 'raw' }, (a) => ({ contents: fs.readFileSync(a.path, 'utf8'), loader: 'text' }));
    }
  }]
}).then((out) => {
  const tpl = fs.readFileSync(__dirname + '/preview.template.html', 'utf8');
  // Function replacement, so `$` sequences in the bundle aren't read as replacement patterns
  fs.writeFileSync(__dirname + '/preview.html', tpl.replace('/*KRISHNA*/', () => out.outputFiles[0].text));
  console.log('wrote design/mascot-svg/preview.html');
});
