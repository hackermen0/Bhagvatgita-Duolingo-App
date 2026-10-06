// Animates the layered Krishna SVG (src/lib/mascot/krishna-animated.svg, built by design/mascot-svg/build-preview.cjs)
// with the Web Animations API. Ported from design/mascot-svg/preview.template.html, where it can still be tried out.
//
// Layers: `bob` carries the idle motion, `char` carries one-shot reactions, so they never fight over a transform.
// The ground shadow stays put; `fx` (particles) sits on top of everything. A reaction swaps in that expression's
// face with a quick blink-cut and *holds* it: the face stays until the next reaction or `rest()`, so a mascot
// that reacts to a right answer keeps smiling while the learner reads the feedback.

const NS = 'http://www.w3.org/2000/svg';

export type Reaction = 'correct' | 'combo' | 'wrong' | 'angry' | 'heartbreak' | 'love' | 'celebrate' | 'think';

export interface Krishna {
  /** Play a one-shot reaction, replacing any reaction in progress. */
  react: (reaction: Reaction) => void;
  /** Return to the default face and pose (idle motion carries on). */
  rest: () => void;
  destroy: () => void;
}

let svgPromise: Promise<string> | null = null;

/** The ~140 KB SVG is its own chunk, fetched the first time any mascot needs it, and cached after that. */
export function loadKrishnaSvg(): Promise<string> {
  return (svgPromise ??= import('./krishna-animated.svg?raw').then((m) => m.default));
}

let instances = 0;

// ids of the body parts, in the SVG's coordinate space (viewBox 0 0 1254 1254)
const HEAD = ['hair-back', 'hair-bun', 'left-ear', 'right-ear', 'head', 'peacock-feather', 'hair-front', 'headband'];
const NECK = [627, 745];
const FEET = [627, 1170];
const FACE = [627, 600];
const P = {
  leftShoulder: [498, 832],
  rightShoulder: [772, 830],
  raisedElbow: [455, 945],
  feather: [735, 240],
  leftEye: [505, 598],
  rightEye: [745, 598],
  earL: [373, 625],
  earR: [882, 625]
};

// Each keyframe writes its own pivot, so stacked animations (composite: 'add') each rotate about the right point
const rot = (a: number, px: number, py: number) => `translate(${px}px, ${py}px) rotate(${a}deg) translate(${-px}px, ${-py}px)`;
const sc = (sx: number, sy: number, px: number, py: number) =>
  `translate(${px}px, ${py}px) scale(${sx}, ${sy}) translate(${-px}px, ${-py}px)`;
const tr = (x: number, y: number) => `translate(${x}px, ${y}px)`;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

const starD = (x: number, y: number, r: number) =>
  `M${x},${y - r}Q${x},${y} ${x + r},${y}Q${x},${y} ${x},${y + r}Q${x},${y} ${x - r},${y}Q${x},${y} ${x},${y - r}Z`;
const heartD = (x: number, y: number, r: number) =>
  `M${x},${y + 0.9 * r}C${x - 1.5 * r},${y - 0.1 * r} ${x - r},${y - 1.25 * r} ${x},${y - 0.45 * r}C${x + r},${y - 1.25 * r} ${x + 1.5 * r},${y - 0.1 * r} ${x},${y + 0.9 * r}Z`;
const dropD = (x: number, y: number, r: number) =>
  `M${x},${y - 1.8 * r}C${x + 0.5 * r},${y - 0.9 * r} ${x + r},${y - 0.3 * r} ${x + r},${y + 0.2 * r}A${r},${r} 0 0 1 ${x - r},${y + 0.2 * r}C${x - r},${y - 0.3 * r} ${x - 0.5 * r},${y - 0.9 * r} ${x},${y - 1.8 * r}Z`;

/** Puts the SVG into `host` and returns the controls. Call `destroy()` when the host goes away. */
export function mountKrishna(host: HTMLElement, markup: string): Krishna {
  host.innerHTML = markup;
  const svg = host.querySelector('svg') as SVGSVGElement;
  svg.style.cssText = 'width:100%;height:100%;overflow:visible;display:block';
  const id = ++instances;
  let destroyed = false;

  const root = (svg.querySelector('#default-krishna') as SVGGElement | null) ?? svg;
  const els: Record<string, SVGElement> = {};
  for (const el of svg.querySelectorAll('[id]')) els[el.id] = el as SVGElement;

  const mk = (name: string) => {
    const g = document.createElementNS(NS, 'g') as SVGGElement;
    g.id = name;
    return (els[name] = g);
  };
  const bob = mk('bob');
  const char = mk('char');
  const fx = mk('fx');
  [...root.children].filter((c) => c.id !== 'shadow').forEach((c) => char.appendChild(c));
  bob.appendChild(char);
  root.appendChild(bob);
  svg.appendChild(fx);
  for (const el of [bob, char, ...Object.values(els)]) el.style.transformOrigin = '0 0';

  // Small decorative bits pivot on their own centre
  const selfPivot = (el: SVGElement) => {
    el.style.transformBox = 'fill-box';
    el.style.transformOrigin = 'center';
  };
  [
    'amazed--left-eye-star', 'amazed--right-eye-star', 'crying--left-tear', 'crying--right-tear',
    'affectionate--left-brush', 'affectionate--right-blush', 'love--left-heart-top', 'love--left-heart-bottom', 'love--right-heart'
  ].forEach((n) => els[n] && selfPivot(els[n]));

  const show = (el: SVGElement | undefined, on: boolean) => {
    if (!el) return;
    if (on) el.removeAttribute('display');
    else el.setAttribute('display', 'none');
  };

  // ── Idle loop: breathing, a gentle head sway, blinking, glancing around ──
  const loops: Animation[] = [];
  const loop = (el: SVGElement, frames: Keyframe[], o: KeyframeAnimationOptions) =>
    loops.push(el.animate(frames, { iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', ...o }));

  function startIdle() {
    stopIdle();
    loop(bob, [{ transform: tr(0, 0) + sc(1, 1, FEET[0], FEET[1]) }, { transform: tr(0, -5) + sc(1.008, 1.012, FEET[0], FEET[1]) }], { duration: 1900 });
    for (const n of HEAD) loop(els[n], [{ transform: rot(-1.3, NECK[0], NECK[1]) }, { transform: rot(1.3, NECK[0], NECK[1]) }], { duration: 3400 });
    loop(els['peacock-feather'], [{ transform: rot(-3.5, P.feather[0], P.feather[1]) }, { transform: rot(3.5, P.feather[0], P.feather[1]) }], { duration: 2300, composite: 'add' });
    loop(els['earring-left'], [{ transform: rot(-9, P.earL[0], P.earL[1]) }, { transform: rot(9, P.earL[0], P.earL[1]) }], { duration: 1500 });
    loop(els['earring-right'], [{ transform: rot(9, P.earR[0], P.earR[1]) }, { transform: rot(-9, P.earR[0], P.earR[1]) }], { duration: 1500 });
    for (const [n, p] of [['left-eye', P.leftEye], ['right-eye', P.rightEye]] as const) {
      loops.push(els[n].animate([
        { transform: sc(1, 1, p[0], p[1]), offset: 0 }, { transform: sc(1, 1, p[0], p[1]), offset: 0.93 },
        { transform: sc(1, 0.07, p[0], p[1]), offset: 0.965 }, { transform: sc(1, 1, p[0], p[1]), offset: 1 }
      ], { duration: 4200, iterations: Infinity }));
    }
    // Glance left, back, right, back
    for (const n of ['left-pupil', 'right-pupil']) {
      loops.push(els[n].animate([
        { transform: tr(0, 0), offset: 0 }, { transform: tr(0, 0), offset: 0.3 },
        { transform: tr(-11, 3), offset: 0.35 }, { transform: tr(-11, 3), offset: 0.5 },
        { transform: tr(0, 0), offset: 0.55 }, { transform: tr(0, 0), offset: 0.7 },
        { transform: tr(10, -2), offset: 0.75 }, { transform: tr(10, -2), offset: 0.88 },
        { transform: tr(0, 0), offset: 0.93 }, { transform: tr(0, 0), offset: 1 }
      ], { duration: 9000, iterations: Infinity, easing: 'ease-out' }));
    }
  }
  function stopIdle() {
    loops.forEach((a) => a.cancel());
    loops.length = 0;
  }

  // ── Reaction bookkeeping: a new reaction cancels the one in progress ──
  let ctx: { anims: Animation[]; timers: ReturnType<typeof setTimeout>[] } | null = null;
  const R = (el: SVGElement | undefined, frames: Keyframe[], o: KeyframeAnimationOptions) => {
    if (!el) return;
    const a = el.animate(frames, { composite: 'add', easing: 'ease-in-out', ...o });
    ctx?.anims.push(a);
  };
  const later = (ms: number, fn: () => void) => {
    ctx?.timers.push(setTimeout(() => !destroyed && fn(), ms));
  };
  function cancelCtx() {
    ctx?.anims.forEach((a) => a.cancel());
    ctx?.timers.forEach(clearTimeout);
    ctx = null;
  }
  function begin() {
    cancelCtx();
    reset();
    ctx = { anims: [], timers: [] };
  }
  // The face and arm are held after the motion ends; only the decoration is cleaned up
  function finish(ms: number) {
    later(ms, () => show(els['love-hearts'], false));
    later(ms + 250, () => (ctx = null));
  }
  function reset() {
    setFace('default', false);
    setArm(false, false);
    show(els['love-hearts'], false);
    flush.style.opacity = '0';
  }

  // ── Face swap: squash the face shut, swap, spring it open (reads as a blink cut) ──
  const faceGroups = [...svg.querySelectorAll<SVGElement>('[data-face]')];
  let face = 'default';
  function setFace(name: string, animate = true) {
    if (name === face) return;
    face = name;
    const swap = () => faceGroups.forEach((g) => show(g, g.dataset.face === face));
    if (!animate) return swap();
    els.faces.animate([{ transform: sc(1, 1, FACE[0], FACE[1]) }, { transform: sc(1.06, 0.08, FACE[0], FACE[1]) }], { duration: 70, easing: 'ease-in' }).onfinish = () => {
      if (destroyed) return;
      swap();
      els.faces.animate([
        { transform: sc(1.06, 0.08, FACE[0], FACE[1]) },
        { transform: sc(0.97, 1.08, FACE[0], FACE[1]), offset: 0.6 },
        { transform: sc(1, 1, FACE[0], FACE[1]) }
      ], { duration: 220, easing: 'ease-out' });
    };
  }

  // ── Arm swap: the raised fist flicks up from the elbow ──
  let armUp = false;
  function setArm(up: boolean, animate = true) {
    if (up === armUp) return;
    armUp = up;
    show(els['left-arm'], !up);
    show(els['arm-raised'], up);
    if (animate) {
      const el = up ? els['arm-raised'] : els['left-arm'];
      const p = up ? P.raisedElbow : P.leftShoulder;
      el.animate([{ transform: rot(up ? -40 : 25, p[0], p[1]) }, { transform: rot(up ? 8 : -5, p[0], p[1]), offset: 0.65 }, { transform: rot(0, p[0], p[1]) }], { duration: 260, easing: 'ease-out' });
    }
  }

  // Red flush for anger: a copy of the head shape, tinted, between the skin and the face
  const gradId = `flushGrad-${id}`;
  const flush = els['head-shape'].cloneNode(true) as SVGElement;
  flush.id = 'flush';
  flush.innerHTML = '';
  svg.insertAdjacentHTML(
    'afterbegin',
    `<defs><linearGradient id="${gradId}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff3b3b" stop-opacity=".75"/><stop offset=".7" stop-color="#ff3b3b" stop-opacity=".25"/><stop offset="1" stop-color="#ff3b3b" stop-opacity="0"/></linearGradient></defs>`
  );
  flush.setAttribute('fill', `url(#${gradId})`);
  flush.style.opacity = '0';
  els['head-shape'].after(flush);

  // ── Particles ──
  function spawn(markup: string, frames: Keyframe[], opts: KeyframeAnimationOptions) {
    if (destroyed) return;
    fx.insertAdjacentHTML('beforeend', markup);
    const el = fx.lastElementChild as SVGElement;
    selfPivot(el);
    const a = el.animate(frames, { fill: 'forwards', ...opts });
    a.onfinish = () => el.remove();
  }
  function sparkles(n: number, cx = 627, cy = 430, radius = 400, colors = ['#f9c517', '#ffffff', '#f9c517']) {
    for (let i = 0; i < n; i++) {
      const ang = ((-170 + (160 * i) / Math.max(1, n - 1) + rand(-8, 8)) * Math.PI) / 180;
      const d = radius * rand(0.75, 1.05);
      const x = cx + Math.cos(ang) * d;
      const y = cy + Math.sin(ang) * d;
      const r = rand(18, 34);
      const c = colors[i % colors.length];
      spawn(`<path d="${starD(x, y, r)}" fill="${c}" stroke="#f3a41f" stroke-width="3"/>`, [
        { transform: `${tr((cx - x) * 0.35, (cy - y) * 0.35)} scale(0) rotate(0deg)`, opacity: 1 },
        { transform: `${tr(0, 0)} scale(1.2) rotate(60deg)`, opacity: 1, offset: 0.45 },
        { transform: `${tr(0, -10)} scale(0) rotate(120deg)`, opacity: 0.6 }
      ], { duration: rand(650, 850), delay: rand(0, 160), easing: 'ease-out' });
    }
  }
  function confetti(n: number) {
    const colors = ['#f9c517', '#f3798c', '#3bb5f8', '#4eb649', '#f18a22', '#a58ebf'];
    for (let i = 0; i < n; i++) {
      const x = 627 + rand(-260, 260);
      const y = rand(60, 140);
      const w = rand(14, 22);
      const h = rand(24, 36);
      const vx = rand(-380, 380);
      const up = rand(-260, -120);
      const fall = rand(950, 1150);
      const spin = rand(-720, 720);
      spawn(`<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="4" fill="${colors[i % colors.length]}"/>`, [
        { transform: `${tr(0, 0)} rotate(0deg) scale(0.4)` },
        { transform: `${tr(vx * 0.55, up)} rotate(${spin * 0.4}deg) scale(1)`, offset: 0.3, easing: 'ease-in' },
        { transform: `${tr(vx, fall)} rotate(${spin}deg) scale(1)`, opacity: 0.9 }
      ], { duration: rand(1500, 2200), delay: rand(0, 200), easing: 'cubic-bezier(.2,.6,.4,1)' });
    }
  }
  function steam(x: number, y: number, dir: number) {
    spawn(`<circle cx="${x}" cy="${y}" r="22" fill="#eef2f6" stroke="#cfd8e0" stroke-width="3"/>`, [
      { transform: `${tr(0, 0)} scale(0.3)`, opacity: 0.95 },
      { transform: `${tr(dir * 70, -60)} scale(1.3)`, opacity: 0.85, offset: 0.5 },
      { transform: `${tr(dir * 120, -140)} scale(1.8)`, opacity: 0 }
    ], { duration: 700, easing: 'ease-out' });
  }
  function teardrop(x: number, y: number, dir: number) {
    const dx = dir * rand(40, 110);
    spawn(`<path d="${dropD(x, y, 13)}" fill="#8fd3ff" stroke="#3a9fd8" stroke-width="2.5"/>`, [
      { transform: `${tr(0, 0)} scale(0.4)` },
      { transform: `${tr(dx * 0.6, -25)} scale(1)`, offset: 0.3, easing: 'ease-in' },
      { transform: `${tr(dx, 380)} scale(0.9)`, opacity: 0.2 }
    ], { duration: rand(750, 950), easing: 'linear' });
  }
  function floatHeart(x: number, y: number, r: number) {
    spawn(`<path d="${heartD(x, y, r)}" fill="#f3798c" stroke="#e0566d" stroke-width="3"/>`, [
      { transform: `${tr(0, 0)} scale(0) rotate(0deg)`, opacity: 1 },
      { transform: `${tr(rand(-20, 20), -60)} scale(1.15) rotate(${rand(-15, 15)}deg)`, opacity: 1, offset: 0.25 },
      { transform: `${tr(rand(-50, 50), -260)} scale(0.8) rotate(${rand(-25, 25)}deg)`, opacity: 0 }
    ], { duration: rand(1300, 1700), easing: 'ease-out' });
  }

  // ── Motion building blocks ──
  function hop(h = 110, dur = 800, armsUp = 38, raisedArm = false) {
    R(char, [
      { transform: tr(0, 0) + sc(1, 1, FEET[0], FEET[1]), offset: 0 },
      { transform: tr(0, 0) + sc(1.07, 0.9, FEET[0], FEET[1]), offset: 0.18 },
      { transform: tr(0, -h) + sc(0.97, 1.05, FEET[0], FEET[1]), offset: 0.5 },
      { transform: tr(0, 0) + sc(1.08, 0.9, FEET[0], FEET[1]), offset: 0.82 },
      { transform: tr(0, 0) + sc(1, 1, FEET[0], FEET[1]), offset: 1 }
    ], { duration: dur, easing: 'ease-out' });
    R(els.shadow, [{ transform: sc(1, 1, 618, 1169) }, { transform: sc(0.7, 0.7, 618, 1169), offset: 0.5 }, { transform: sc(1, 1, 618, 1169) }], { duration: dur });
    const arms: [string, number[], number][] = [['right-arm', P.rightShoulder, -armsUp]];
    if (!raisedArm) arms.push(['left-arm', P.leftShoulder, armsUp]);
    for (const [n, p, a] of arms) R(els[n], [{ transform: rot(0, p[0], p[1]) }, { transform: rot(a, p[0], p[1]), offset: 0.5 }, { transform: rot(0, p[0], p[1]) }], { duration: dur });
    R(els['peacock-feather'], [
      { transform: rot(0, P.feather[0], P.feather[1]) }, { transform: rot(-10, P.feather[0], P.feather[1]), offset: 0.5 },
      { transform: rot(4, P.feather[0], P.feather[1]), offset: 0.8 }, { transform: rot(0, P.feather[0], P.feather[1]) }
    ], { duration: dur });
  }
  const headSeq = (angles: number[], dur: number, extra: (i: number, a: number) => string = () => '', o: KeyframeAnimationOptions = {}) => {
    for (const n of HEAD) R(els[n], angles.map((a, i) => ({ transform: rot(a, NECK[0], NECK[1]) + extra(i, a), offset: i / (angles.length - 1) })), { duration: dur, ...o });
  };
  const pulse = (n: string, s: number, dur: number, iterations = 1) =>
    R(els[n], [{ transform: 'scale(1)' }, { transform: `scale(${s})` }, { transform: 'scale(1)' }], { duration: dur, iterations });
  const wave = (angles: number[], p: number[]) => angles.map((a, i, arr) => ({ transform: rot(a, p[0], p[1]), offset: i / (arr.length - 1) }));

  // ── Reactions ──
  const reactions: Record<Reaction, () => void> = {
    correct() {
      begin();
      setFace('laughing');
      setArm(true);
      hop(100, 760, 34, true);
      later(120, () => headSeq([0, -5, 4, -5, 4, -3, 0], 900, (_i, a) => tr(0, a ? 3 : 0), { easing: 'linear' }));
      R(els['arm-raised'], wave([0, -14, 6, -14, 6, 0], P.raisedElbow), { duration: 900, delay: 150 });
      later(260, () => sparkles(5));
      finish(1300);
    },
    combo() {
      begin();
      setFace('amazed');
      hop(160, 900, 55);
      for (const n of ['amazed--left-eye-star', 'amazed--right-eye-star']) {
        R(els[n], [
          { transform: 'rotate(0deg) scale(1)' }, { transform: 'rotate(90deg) scale(1.45)', offset: 0.3 },
          { transform: 'rotate(180deg) scale(1)', offset: 0.6 }, { transform: 'rotate(270deg) scale(1.35)', offset: 0.8 },
          { transform: 'rotate(360deg) scale(1)' }
        ], { duration: 1500, easing: 'ease-in-out' });
      }
      later(300, () => sparkles(9, 627, 440, 440, ['#f9c517', '#ffffff', '#3bb5f8']));
      later(800, () => sparkles(5, 627, 420, 330));
      finish(1700);
    },
    wrong() {
      begin();
      setFace('disappointed');
      const dur = 1500;
      const hold = (a: string, b: string): Keyframe[] => [{ transform: a, offset: 0 }, { transform: b, offset: 0.2 }, { transform: b, offset: 0.82 }, { transform: a, offset: 1 }];
      R(char, hold(tr(0, 0) + sc(1, 1, FEET[0], FEET[1]), tr(0, 8) + sc(1.03, 0.94, FEET[0], FEET[1])), { duration: dur });
      headSeq([0, 3, -5, 5, -4, 3, 3, 0], dur, (i) => tr(0, i === 0 || i === 7 ? 0 : 14));
      R(els['left-arm'], hold(rot(0, P.leftShoulder[0], P.leftShoulder[1]), rot(-8, P.leftShoulder[0], P.leftShoulder[1])), { duration: dur });
      R(els['right-arm'], hold(rot(0, P.rightShoulder[0], P.rightShoulder[1]), rot(6, P.rightShoulder[0], P.rightShoulder[1])), { duration: dur });
      R(els['peacock-feather'], hold(rot(0, P.feather[0], P.feather[1]), rot(16, P.feather[0], P.feather[1])), { duration: dur });
      later(350, () => spawn(`<path d="${dropD(858, 470, 16)}" fill="#8fd3ff" stroke="#3a9fd8" stroke-width="3"/>`, [
        { transform: 'translate(0,0) scale(0)', opacity: 1 }, { transform: 'translate(0,0) scale(1)', opacity: 1, offset: 0.2 },
        { transform: 'translate(8px,70px) scale(0.9)', opacity: 0 }
      ], { duration: 1000, easing: 'ease-in' }));
      finish(1450);
    },
    angry() {
      begin();
      setFace('angry');
      ctx?.anims.push(flush.animate([{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }], { duration: 1600 }));
      const shake = [0, -14, 14, -12, 12, -9, 9, -5, 5, 0];
      R(char, shake.map((x, i) => ({ transform: tr(x, 0) + sc(1, 1, FEET[0], FEET[1]), offset: i / (shake.length - 1) })), { duration: 600, delay: 100, easing: 'linear' });
      R(char, [
        { transform: tr(0, 0) + sc(1, 1, FEET[0], FEET[1]) }, { transform: tr(0, -40) + sc(0.98, 1.04, FEET[0], FEET[1]), offset: 0.4 },
        { transform: tr(0, 0) + sc(1.1, 0.88, FEET[0], FEET[1]), offset: 0.7 }, { transform: tr(0, 0) + sc(1, 1, FEET[0], FEET[1]) }
      ], { duration: 420, delay: 750 });
      headSeq([0, -3, 3, -3, 3, -2, 2, 0], 1300, (_i, a) => tr(0, a ? 4 : 0), { easing: 'linear', delay: 100 });
      R(els['left-arm'], [
        { transform: rot(0, P.leftShoulder[0], P.leftShoulder[1]) }, { transform: rot(-12, P.leftShoulder[0], P.leftShoulder[1]), offset: 0.3 },
        { transform: rot(-12, P.leftShoulder[0], P.leftShoulder[1]), offset: 0.8 }, { transform: rot(0, P.leftShoulder[0], P.leftShoulder[1]) }
      ], { duration: 1500 });
      for (let k = 0; k < 4; k++) later(250 + k * 230, () => { steam(305, 600, -1); steam(950, 600, 1); });
      finish(1550);
    },
    heartbreak() {
      begin();
      setFace('crying');
      setArm(true);
      const dur = 2500;
      const sob: Keyframe[] = [];
      for (let i = 0; i <= 14; i++) sob.push({ transform: tr(0, i % 2 ? 7 : 0) + sc(i % 2 ? 1.015 : 1, i % 2 ? 0.985 : 1, FEET[0], FEET[1]), offset: i / 14 });
      R(char, sob, { duration: dur, easing: 'ease-in-out' });
      R(els['arm-raised'], wave([0, 6, -3, 6, -3, 6, -3, 6, 0], P.raisedElbow), { duration: dur });
      headSeq([0, 4, 4, 2, 4, 0], dur, (i) => tr(0, i === 0 || i === 5 ? 0 : 10));
      R(els['peacock-feather'], [
        { transform: rot(0, P.feather[0], P.feather[1]) }, { transform: rot(18, P.feather[0], P.feather[1]), offset: 0.15 },
        { transform: rot(18, P.feather[0], P.feather[1]), offset: 0.85 }, { transform: rot(0, P.feather[0], P.feather[1]) }
      ], { duration: dur });
      for (const n of ['crying--left-tear', 'crying--right-tear']) R(els[n], [{ transform: 'scale(1,1)' }, { transform: 'scale(1.25,1.35)' }, { transform: 'scale(1,1)' }], { duration: 300, iterations: 8 });
      for (let k = 0; k < 11; k++) later(200 + k * 190, () => { teardrop(484, 664, -1); teardrop(786, 662, 1); });
      finish(2450);
    },
    love() {
      begin();
      setFace('affectionate');
      show(els['love-hearts'], true);
      ['love--left-heart-top', 'love--right-heart', 'love--left-heart-bottom'].forEach((n, i) => {
        R(els[n], [
          { transform: 'translate(0,0) scale(0)', opacity: 1 }, { transform: 'translate(0,0) scale(1.3)', opacity: 1, offset: 0.12 },
          { transform: 'translate(0,0) scale(1)', opacity: 1, offset: 0.2 }, { transform: 'translate(0,-15px) scale(1.12)', opacity: 1, offset: 0.45 },
          { transform: 'translate(0,-5px) scale(1)', opacity: 1, offset: 0.7 }, { transform: 'translate(0,-120px) scale(0.7)', opacity: 0 }
        ], { duration: 2300, delay: i * 140, fill: 'backwards', composite: 'replace' });
      });
      headSeq([0, -7, -7, 6, 6, 0], 2300);
      R(char, [
        { transform: rot(0, FEET[0], FEET[1]) }, { transform: rot(-2.5, FEET[0], FEET[1]), offset: 0.3 },
        { transform: rot(2.5, FEET[0], FEET[1]), offset: 0.7 }, { transform: rot(0, FEET[0], FEET[1]) }
      ], { duration: 2300 });
      pulse('affectionate--left-brush', 1.18, 500, 4);
      pulse('affectionate--right-blush', 1.18, 500, 4);
      for (let k = 0; k < 7; k++) later(300 + k * 260, () => floatHeart(627 + (k % 2 ? 1 : -1) * rand(300, 390), rand(420, 700), rand(18, 30)));
      finish(2350);
    },
    celebrate() {
      begin();
      setFace('amazed');
      hop(170, 950, 60);
      later(150, () => confetti(46));
      later(300, () => sparkles(7, 627, 430, 420));
      later(900, () => { setFace('laughing'); setArm(true); });
      later(950, () => {
        hop(150, 850, 40, true);
        R(els['arm-raised'], wave([0, -16, 6, -16, 0], P.raisedElbow), { duration: 850 });
        headSeq([0, -6, 5, -6, 5, 0], 850, () => '', { easing: 'linear' });
      });
      later(1500, () => confetti(24));
      finish(2300);
    },
    think() {
      begin();
      const dur = 1800;
      const hold = (a: string, b: string): Keyframe[] => [{ transform: a }, { transform: b, offset: 0.25 }, { transform: b, offset: 0.8 }, { transform: a }];
      for (const n of HEAD) R(els[n], hold(rot(0, NECK[0], NECK[1]), rot(9, NECK[0], NECK[1]) + tr(6, 0)), { duration: dur });
      R(els['eye-brow-right'], hold(tr(0, 0), tr(0, -18)), { duration: dur });
      for (const n of ['left-pupil', 'right-pupil']) R(els[n], hold(tr(0, 0), tr(-14, -22)), { duration: dur });
      finish(dur);
    }
  };

  startIdle();

  return {
    react: (r) => !destroyed && reactions[r](),
    rest() {
      if (destroyed) return;
      cancelCtx();
      setFace('default');
      setArm(false);
      show(els['love-hearts'], false);
      flush.style.opacity = '0';
    },
    destroy() {
      destroyed = true;
      stopIdle();
      cancelCtx();
      host.innerHTML = '';
    }
  };
}
