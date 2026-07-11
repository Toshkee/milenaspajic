# Milena Spajić — Portfolio

A single-page personal portfolio for **Milena Spajić**, Account & Operations Manager
(Marketing · Client Relations · Events).

**Design direction:** *Editorial Atelier* — a "Rosé & Champagne" palette (blush · deep plum ·
champagne gold), Editorial-Luxe typography (Playfair Display + Inter), and lush, cinematic
GSAP floral animation (hand-crafted SVG roses, peonies & tulips that bloom, drift and grow).

**Motion layer (GSAP 3.13 + SplitText + ScrollTrigger + Lenis):** preloader curtain intro,
per-character hero name reveal, masked word-by-word section titles with a gold shimmer sweep
on the italic accents, an interactive canvas petal field (petals react to the cursor like wind
and gust with scroll speed), scroll progress bar, mouse-parallax
hero layers, 3D tilt + glare on the portrait and gallery cards, film grain overlay.
Everything degrades gracefully: reduced-motion users and no-JS visitors get the full static site.

Built with [Vite](https://vitejs.dev) — npm-managed, no framework.

---

## Develop locally

```bash
npm install
npm run dev      # dev server with hot reload → http://localhost:5173
```

## Build & deploy

```bash
npm run build    # production build → dist/
npm run preview  # sanity-check the build locally
```

- **Netlify (easiest):** drag the `dist/` folder onto <https://app.netlify.com/drop>,
  or connect the repo (build command `npm run build`, publish directory `dist`).
- **Vercel:** `npx vercel` — it auto-detects Vite.
- **GitHub Pages:** build, then publish `dist/` (e.g. with the `actions/deploy-pages` workflow).

The output is fully static, so any static host works. Fonts load from Google Fonts.

---

## Customising it

### 1. Swap Milena's portrait
Replace `public/assets/portrait.jpg`. The crop inside the arch frame is tuned via
`object-position` on `.portrait__frame img` in `styles.css`.

### 2. Add work / project images
Drop images into `public/assets/`, then in the `#work` section replace each `.ph`
placeholder block with:

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
The "Download CV" buttons link to `assets/Milena-Spajic-CV.pdf`. Replace
`public/assets/Milena-Spajic-CV.pdf` to update it.

---

## Project structure

```
index.html        — the page (all content + inlined SVG flower sprite, hero rose & timeline vine)
styles.css        — design system + all section styles (tokens in :root)
main.js           — GSAP/ScrollTrigger/SplitText/Lenis animation (ES module, imports from npm)
package.json      — npm scripts (dev / build / preview) + dependencies (gsap, lenis, vite)
public/assets/
  portrait.jpg
  Milena-Spajic-CV.pdf
  flowers/        — the 8 hand-crafted botanical SVGs (also inlined in the page)
```

## Accessibility & performance notes
- Respects `prefers-reduced-motion` — animations disable and all content shows statically.
- Works with JavaScript disabled (content is fully visible; only the motion is lost).
- Keyboard-navigable with visible focus states and a skip link.
- SVG vector flowers (crisp at any size, tiny file weight).
