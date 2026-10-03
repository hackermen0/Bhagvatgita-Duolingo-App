# Handover

Mobile-first, Duolingo-style Bhagavad Gita learning app. SvelteKit 5 (runes) + Tailwind v4, deployed on Vercel (`adapter-auto`, `engines.node: 20.x`). No backend: all progress is in `localStorage` (`gita_game_state`). Git HEAD at time of writing: `317ba45`, working tree clean.

Run: `npm run dev` · type-check: `npm run check` (0 errors / 0 warnings at last run).

---

## 1. How the learning flow works now

Each verse (a node on the path) is taught over **three levels**; the node shows a 3-segment ring that fills as levels finish.

| Level | What the learner does | Code |
|---|---|---|
| 1. Meet the words | Verse intro (meaning first, verse as numbered chunks, Listen) → per part: flip-card grid of 3–4 words → word matching warm-up | `VerseHookScreen`, `WordDiscoveryScreen`, `WordCard` |
| 2. Build the phrases | Per part: `PhraseIntroScreen` → joined-phrase matching → **"Write this in English"** (`translate`) → phrase building (`sentence_rebuilding`) → optional comprehension question | `PhraseIntroScreen`, `TranslateExercise`, `WordTilePicker` |
| 3. Put it together | Final stage + full-verse exercises + reflection | `QuizScreen` `synthesis_*` phases |

- `QuizScreen.svelte` takes a `level` prop (1–3). The route `src/routes/lesson/[lessonId]/+page.svelte` reads `?level=` and **clamps it to `levelsDone + 1`**, so levels can't be skipped.
- Progress: `gameState.levelProgress` (per lesson, levels done) + `completedLessons`. A lesson completes only with level 3; completed lessons count as 3/3. XP per first-time level: 15 / 15 / 20 (= the old 50). Quitting mid-level saves nothing (restarts the level).
- Warm-up questions (`warmup: true`) are Level 1's retrieval check; everything else per part is Level 2. Profiles that skip warm-ups get no exercises in Level 1.
- Practice and jump-test modes are not level-split (`mode !== 'lesson'` plays as before).

## 2. Content (src/lib/data/gitaData.ts)

8 verses in Chapter 2 (BG 2.47, 2.48, 2.50, 2.71 in Unit 1; 2.13, 2.20, 2.22, 2.23 in Unit 2), 31 parts total.

- Every part has: matching (≥2 pairs) → `translate` → `sentence_rebuilding`, some end with a comprehension question. IDs: `…_m` (matching), `…_t` (translate), `…_r` (rebuild).
- `essence` (one-line meaning, shown on the verse intro), `verseWordGuide` (Devanagari↔roman token alignment), `hint` on single-phrase rebuilds (the part's English meaning).
- **All English glosses, explanations and `essence` lines were written by Claude and have not been reviewed by a Sanskrit-literate person.** Review before release.
- Every word shown in tiles/pairs/options must exist in `SANSKRIT_DICT` (`sanskritHelper.ts`) or it renders as raw IAST. A validation script (scratchpad, not in repo) checked: tiles spell targets, all words in the dictionary, all words taught earlier. Re-run an equivalent when adding content.

### The `translate` exercise ("Write this in English")
Graded by **meaning words, not order**: correct if the selection contains exactly the reference answer's non-grammar words and no decoys (grammar words like *is/in/the/of/it* are optional). A different phrasing shows "Another way to say it". Logic is in `QuizScreen.checkAnswer`, grammar-word set `GRAMMAR_WORDS`. Side effect: scrambled-but-complete word sets also pass (deliberate).

### WordTilePicker
Placed tiles can be **dragged to reorder** (pointer events, FLIP animation; tap still removes; arrow keys move a focused tile). `plain` prop renders English tiles. Tested with mouse, touch and keyboard on a throwaway page only.

## 3. Other changes this session (all committed)
- Verse intro redesign: meaning card, numbered colour-coded chunks, Listen is primary, "Let's learn it" turns primary after one listen. Slow/Normal speed toggle also on `PhraseIntroScreen`.
- Word cards: all words of a part in a flip grid; back shows only the meaning + the word in the learner's script (no part of speech / syllables).
- Streak UI uses dedicated orange tokens (`--color-streak*` in `app.css`), independent of the blue brand colour.
- Path: more top padding so the floating "Start" bubble clears the unit banner.
- Theme is blue (`#3BB5F8` family); mascot is Krishna (15 WebP mood images in `static/mascot/`, `Mascot.svelte` with `MascotMood`).

## 4. Mascot animation (in progress — not in the app yet)

Goal: Duolingo-style animated Krishna that reacts to right/wrong answers. Decision: **animate the layered SVG directly with the Web Animations API** (no Lottie/Rive — no extra dependency, instant to trigger from lesson code).

Files in `design/mascot-svg/`:
- `krishna-mascot.svg` — user-made layered export (Illustrator, traced from the PNG). Group IDs are the API: `head`, `hair-back`, `hair-front`, `hair-bun`, `left-ear`, `right-ear`, `left-eye`/`right-eye` (+ `left-pupil`/`right-pupil`), `eye-brow-left/right`, `mouth`, `tilak`, `headband`, `peacock-feather`, `earring-left/right`, `body`, `necklace`, `sash`, `Lungi`, `left-arm`, `right-arm` (contains the flute + `hand-right-fingers`), `leg-left/right`, `shadow`.
- `preview.template.html` + `build-preview.cjs` → `preview.html` (open in a browser; buttons Correct / Wrong / Thinking / Celebrate, idle toggle). Rebuild with `node build-preview.cjs` after re-exporting the SVG.
- Verified in a headless browser: idle loop + 4 reactions run with no errors, no gaps at joints when arms rotate/head tilts.

Preview limits: expressions are faked (mouth flipped for a frown, eyes squashed for a blink). Faint seam in the hair near the ears (overlap the two hair shapes in Illustrator to fix). SVG angles: positive = clockwise, so the viewer's-left arm lifts with `+`, right arm with `−`.

### Next steps
1. **Expression variants (user is drawing these).** One artboard per emotion, whole character copied, group named `<emotion>-krishna` (e.g. `disappointed-krishna`), face parts named like the defaults (`left-eye`, `eye-brow-left`, `mouth`, plus extras like `eyelid-left`, tears). First export received as a screenshot only — **the SVG itself has not been sent yet**. Plan: export with *Use Artboards* so each is its own SVG; code takes only the face parts and swaps them over the default face (with a quick squash) during reactions.
   Suggested first three: `disappointed` (wrong), `cheerful` (correct), `shocked` (wrong match). Full mapping idea: wrong→disappointed, last heart→worried, wrong pair→shocked_1, correct→cheerful, streak 3/5→too_exited/amazed, out of hearts→crying, complete→celebrating.
   Emotion PNGs use the same body pose except celebrating, thinking, proud, unimpressed, too_exited, fire_angry, super_angry (those change arms/body — later). Detailed eyes in most emotion PNGs differ from the default's plain eyes; consider redrawing the default face to match.
2. Write the face-swap logic in the preview first, then verify the Wrong reaction with the real disappointed face.
3. **Wire into the app:** replace the image in `Mascot.svelte` with the inline SVG + animation module; keep the WebP images as fallback for moods without an animation; respect `prefers-reduced-motion`; call reactions from `QuizScreen` where `exerciseMood` is computed. Lazy-load the SVG (~74 KB).

## 5. Not done / open items
- **Capacitor (Android/iOS) packaging**: planned only, nothing implemented. Plan file: `C:\Users\KIIT\.claude\plans\ok-now-plan-out-proud-lighthouse.md` (adapter-static SPA via `BUILD_TARGET=capacitor`, `ssr = false`, self-host fonts, back-button + status-bar plugins, store checklists).
- No real-device testing of: Hindi TTS (`hi-IN`) voices / word sync, drag-reorder on a phone, safe-area insets, Android back button. Speech was always faked in browser tests.
- Not click-tested: BG 2.23 duplicate-tile synthesis screens; "worried" (last heart) and 5-combo "amazed" mascot states.
- Extra exercise types considered but not built: audio-only "tap what you hear" to build Sanskrit, English→Sanskrit reverse build, audio-only fill-in-the-blank. The `translate` speaker has no Slow/Normal toggle.
- Contrast: white text on `#3BB5F8` is ~2.3:1 (accepted, like Duolingo); primary-dark on soft passes at 4.73:1.
- Spaced-repetition and daily-quest systems are unchanged by the level split (`completeLevel` still updates word memory and the streak on every level).

## 6. Working notes
- Verification pattern used throughout: `npm run check`, then headless Chrome via `puppeteer-core` (local Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`) against a dev server on a spare port, with `speechSynthesis` stubbed. Those scripts lived in the session scratchpad and are **not** in the repo.
- `design/mascot-source/` holds the 31 original emotion PNGs (36 MB; deliberately kept out of `static/`). `scripts/process-mascots.py` regenerates `static/mascot/*.webp` (background removal).
- Dev servers were occasionally left running on test ports (5230–5321 range); kill any stray `vite dev` processes.
