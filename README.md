# Milena Spajić — Portfolio

A single-page personal portfolio for **Milena Spajić**, Account & Operations Manager
(Marketing · Client Relations · Events).

**Design direction:** *Editorial Atelier* — a "Rosé & Champagne" palette (blush · deep plum ·
champagne gold), Editorial-Luxe typography (Playfair Display + Inter), and lush, cinematic
GSAP floral animation (hand-crafted SVG roses, peonies & tulips that bloom, drift and grow).

No build step. No framework. Just open it.

---

## View it locally

**Option A — open directly:** double-click `index.html`.

**Option B — local server** (recommended, matches production exactly):

```bash
cd milenaspajic
python3 -m http.server 8099
# then visit http://localhost:8099
```

## Put it online (free)

- **Netlify (easiest):** drag the whole project folder onto <https://app.netlify.com/drop>.
- **Vercel:** `npx vercel` in this folder, or import the repo at vercel.com.
- **GitHub Pages:** push to a repo → Settings → Pages → deploy from the `main` branch root.

Everything is static, so any static host works. Fonts load from Google Fonts (needs internet);
GSAP & Lenis are vendored locally in `vendor/` and work offline.

---

## Customising it

### 1. Add Milena's portrait
In `index.html`, find the hero `.portrait__frame` and replace the
`.portrait__placeholder` block with:

```html
<img src="assets/portrait.jpg" alt="Portrait of Milena Spajić" />
```

Drop the photo into `assets/portrait.jpg` (a portrait-orientation 4:5 image looks best).

### 2. Add work / project images
In the `#work` section, replace each `.ph` placeholder block with:

```html
<img src="assets/work-1.jpg" alt="Short description of the project" />
```

You can delete the `.gallery__note` line once real images are in.

### 3. Edit text
All copy lives directly in `index.html` — experience bullets, education, skills levels
(`data-level="92"`), language dots (add/remove `<span class="lang__dot on">`), etc.

### 4. Change colours or fonts
All design tokens are at the top of `styles.css` under `:root` (e.g. `--rose-500`, `--plum-900`,
`--gold`). Change them in one place and the whole site updates. Fonts are set via `--font-display`
and `--font-body`.

### 5. CV download
The "Download CV" buttons link to `assets/Milena-Spajic-CV.pdf`. Replace that file to update it.

---

## Project structure

```
index.html        — the page (all content + inlined SVG flower sprite, hero rose & timeline vine)
styles.css        — design system + all section styles (tokens in :root)
main.js           — GSAP/ScrollTrigger/Lenis animation (progressive enhancement)
vendor/           — gsap, ScrollTrigger, lenis (vendored, offline-safe)
assets/
  Milena-Spajic-CV.pdf
  flowers/        — the 8 hand-crafted botanical SVGs (also inlined in the page)
```

## Accessibility & performance notes
- Respects `prefers-reduced-motion` — animations disable and all content shows statically.
- Works with JavaScript disabled (content is fully visible; only the motion is lost).
- Keyboard-navigable with visible focus states and a skip link.
- SVG vector flowers (crisp at any size, tiny file weight).
