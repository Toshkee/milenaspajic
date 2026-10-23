# Milena Spajić — Portfolio

A single-page personal portfolio for **Milena Spajić**, Account & Operations Manager
(Marketing · Client Relations · Events).

**Design direction:** *Noir Couture* — ink-black & champagne-gold palette that warms up as you
scroll (a dusty-rosé Skills section, then deep wine from Contact to the footer), Bodoni Moda display
type with Manrope body text, and a cinematic, Awwwards-style motion layer.

**Motion layer (GSAP 3 + ScrollTrigger + SplitText + Lenis):** a hero where a gold pen traces
the outline of her name before the letters fill in, then the photo rises behind the name on
scroll while the name splits apart (difference-blended over the photo), a scroll-driven marquee of her actual route
(Podgorica → London → Miami, with years), a word-by-word lit statement, a pinned horizontal
experience track, theme flips (ink → rosé on Skills, wine from Contact to the end), a blend-mode cursor and
magnetic buttons. Everything degrades gracefully: reduced-motion users and no-JS visitors get
the full static site.

**Copy rule:** every line on the page is a fact from the CV. No numbered sections, no invented
stats or taglines, no decorative glyphs.

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

- **Vercel (recommended):** import the repo at <https://vercel.com/new>. It auto-detects Vite
  (build `npm run build`, output `dist`). `vercel.json` adds long-lived caching for the hashed
  files in `/static`.
- **Social preview & SEO URLs:** `og:image`, `og:url`, the canonical link and the JSON-LD block
  use `%SITE_URL%`, filled in at build time by `vite.config.js`. On Vercel the production domain
  (`*.vercel.app`) is used automatically. When the custom domain is live, add an environment
  variable `SITE_URL=https://yourdomain.com` in the Vercel project settings and redeploy.
  After deploying, check the card with the LinkedIn Post Inspector or opengraph.xyz.

The output is fully static, so any static host works. Fonts load from Google Fonts.

---

## Customising it

### 1. Swap Milena's portrait
Replace `public/assets/portrait.jpg`. The crop is `object-position` on `.hero__media img` in
`styles.css`.

### 2. Add work / project images
The Work section is commented out in `index.html` until real images exist. Drop images into
`public/assets/`, uncomment the `#work` block, fill in one `<figure>` per image, and add "Work"
back to both navs. `initWork()` in `main.js` picks it up automatically.


### 3. Edit text
All copy lives directly in `index.html`: experience, skills rows, education, languages, etc.

### 4. Change colours or fonts
All design tokens are at the top of `styles.css` under `:root` (e.g. `--ink`, `--bone`, `--gold`, `--rose-bg`, `--wine`). Section colours are set by `data-theme="rose|wine"` on a section
plus the matching `.theme-*` block in `styles.css`. Change them in one place and the whole site updates. Fonts are set via `--font-display`
and `--font-body`.

### 5. Favicon & social image
`public/favicon-32.png`, `public/apple-touch-icon.png`, `public/icon-512.png` (gold Bodoni "M" on ink)
and `public/assets/og.jpg` (1200×630 share card). Replace them as a set if the brand changes.

### 6. CV download
The "Download CV" buttons link to `assets/Milena-Spajic-CV.pdf`. Replace
`public/assets/Milena-Spajic-CV.pdf` to update it.

---

## Project structure

```
index.html        — the page (all content)
styles.css        — design system + all section styles (tokens in :root)
main.js           — GSAP/ScrollTrigger/SplitText/Lenis motion layer (ES module, imports from npm)
package.json      — npm scripts (dev / build / preview) + dependencies (gsap, lenis, vite)
vite.config.js    — build tweaks + %SITE_URL% replacement for absolute social/SEO URLs
vercel.json       — cache headers for hashed build files
public/assets/
  portrait.jpg
  Milena-Spajic-CV.pdf
  flowers/        — botanical SVGs from the previous floral design (unused now)
```

## Accessibility & performance notes
- Respects `prefers-reduced-motion` — animations disable and all content shows statically.
- Works with JavaScript disabled (content is fully visible; only the motion is lost).
- Keyboard-navigable with visible focus states and a skip link.
- Custom cursor only on fine pointers; horizontal career scroll only on screens ≥ 961px.
