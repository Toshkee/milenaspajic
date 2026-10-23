/* =============================================================
   MILENA SPAJIĆ — Portfolio · "Noir Couture" motion layer
   GSAP 3 + ScrollTrigger + SplitText + Lenis (via npm/Vite)
   Progressive enhancement — static site if motion unavailable
   ============================================================= */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

(function () {
  "use strict";

  const root = document.documentElement;
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (import.meta.env.DEV) Object.assign(window, { gsap, ScrollTrigger });

  initYear();
  initContactForm();
  initCopyEmail();

  // Reduced motion → static, fully-visible site.
  if (reduce) {
    root.classList.add("no-enhance");
    initMenu(null);
    initAnchors(null);
    return;
  }

  /* ---------- Smooth scroll (Lenis) ---------- */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (!location.hash) window.scrollTo(0, 0);

  let lenis = null;
  if (finePointer) {
    lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Shared scroll state (velocity drives the marquee)
  const scroll = { v: 0, dir: 1, t: 0 };
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => { scroll.v = self.getVelocity(); scroll.dir = self.direction; scroll.t = performance.now(); },
  });
  // onUpdate stops firing when scrolling stops — let the velocity settle back to 0
  gsap.ticker.add(() => { if (performance.now() - scroll.t > 60) scroll.v *= 0.85; });

  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  const imgReady = new Promise((r) => {
    const img = $(".hero__media img");
    if (!img || img.complete) r(); else { img.addEventListener("load", r, { once: true }); img.addEventListener("error", r, { once: true }); }
  });
  const ready = Promise.race([Promise.all([fontsReady, imgReady]), new Promise((r) => setTimeout(r, 3000))]);

  initCursor();
  initMenu(lenis);
  initAnchors(lenis);
  initMagnetic();

  ready.then(() => {
    const hero = initHero();
    initMarquee();
    initAbout();
    initCareer();
    initTheme();
    initExpertise();
    initWork();
    initEducation();
    initContact();
    initNav();
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    if (location.hash) {
      const target = $(location.hash);
      if (target) lenis ? lenis.scrollTo(target, { immediate: true }) : target.scrollIntoView();
    }
    hero.play();
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());

  /* =============================================================
     Hero — the name writes itself in; the photo rises in on scroll
     ============================================================= */
  function initHero() {
    const hero = $(".hero");
    const media = $(".hero__media", hero);
    const img = $("img", media);
    const shade = $(".hero__shade", hero);
    const line1 = $(".hero__line--1", hero);
    const line2 = $(".hero__line--2", hero);
    const extras = $$(".hero__foot", hero);
    const introBits = [...$$(".hero__foot > *", hero), ...$$(".nav > *")];

    // r: photo reveal (0 hidden below → 1 full bleed). The mask slides up while the photo
    // counter-slides, so it reads like a wipe but stays transform-only (no repaints).
    const st = { r: 0 };
    function render() {
      const off = ((1 - st.r) * 100).toFixed(3);
      media.style.transform = `translate3d(0, ${off}%, 0)`;
      img.style.transform = `translate3d(0, -${off}%, 0) scale(${(1.25 - 0.25 * st.r).toFixed(4)})`;
    }
    render();

    const words = [line1, line2].map((line) => {
      const word = $(".hero__word", line);
      return { word, chars: new SplitText(word, { type: "chars" }).chars };
    });
    const ink = buildInk(words);

    gsap.set(introBits, { opacity: 0, y: 20 });

    // Scroll scene: the stage is CSS-sticky inside a tall section (no JS pin, so no jitter on
    // phones). Touch scrolling maps 1:1; the mouse gets a little smoothing.
    gsap.timeline({
      scrollTrigger: {
        trigger: hero, start: "top top", end: "bottom bottom",
        scrub: finePointer ? 1 : true,
      },
    })
      .fromTo(st, { r: 0 }, { r: 1, duration: 1, ease: "power2.inOut", onUpdate: render, immediateRender: false }, 0)
      .to(extras, { opacity: 0, y: -30, duration: 0.3 }, 0)
      .to(line1, { xPercent: -45, opacity: 0, duration: 0.6, ease: "power2.in" }, 0.45)
      .to(line2, { xPercent: 45, opacity: 0, duration: 0.6, ease: "power2.in" }, 0.45)
      .to(shade, { opacity: 0.6, duration: 0.4 }, 0.65)
      .to({}, { duration: 0.2 });

    // Cursor-follow glow + subtle name parallax
    if (finePointer) {
      const glow = $(".hero__glow", hero);
      gsap.set(glow, { x: innerWidth / 2, y: innerHeight / 2 });
      const gx = gsap.quickTo(glow, "x", { duration: 1.2, ease: "power3.out" });
      const gy = gsap.quickTo(glow, "y", { duration: 1.2, ease: "power3.out" });
      const w1 = gsap.quickTo(words[0].word, "x", { duration: 1.4, ease: "power3.out" });
      const w2 = gsap.quickTo(words[1].word, "x", { duration: 1.4, ease: "power3.out" });
      hero.addEventListener("pointermove", (e) => {
        const r = hero.getBoundingClientRect();
        gx(e.clientX - r.left); gy(e.clientY - r.top);
        const nx = e.clientX / innerWidth - 0.5;
        w1(nx * -30); w2(nx * 30);
      });
    }

    // Intro: a gold pen traces each letter, the ink fills in, then the real text takes over
    const intro = gsap.timeline({ paused: true });
    ink.texts.forEach((t, i) => {
      intro.to(t, { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" }, i * 0.11);
      intro.to(t, { fillOpacity: 1, strokeOpacity: 0, duration: 0.9, ease: "power1.out" }, i * 0.11 + 1.05);
    });
    intro
      .add(() => { gsap.set(ink.chars, { opacity: 1 }); ink.svgs.forEach((svg) => svg.remove()); })
      .to(introBits, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.06 }, 1.4);
    return intro;
  }

  // Overlay each split word with SVG <text> glyphs at the exact same spots, so their
  // outlines can be stroke-drawn. The HTML letters stay hidden until the ink is dry.
  function buildInk(words) {
    const NS = "http://www.w3.org/2000/svg";
    const out = { svgs: [], texts: [], chars: [] };
    words.forEach(({ word, chars }) => {
      const probe = document.createElement("span");
      probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
      word.appendChild(probe);
      const baseline = probe.offsetTop;
      probe.remove();

      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("class", "hero__ink");
      svg.setAttribute("aria-hidden", "true");
      svg.setAttribute("width", word.offsetWidth);
      svg.setAttribute("height", word.offsetHeight);
      chars.forEach((ch) => {
        const c = getComputedStyle(ch);
        const t = document.createElementNS(NS, "text");
        t.textContent = ch.textContent;
        t.setAttribute("x", ch.offsetLeft);
        t.setAttribute("y", baseline);
        Object.assign(t.style, {
          fontFamily: c.fontFamily, fontSize: c.fontSize, fontStyle: c.fontStyle,
          fontWeight: c.fontWeight, fontVariationSettings: c.fontVariationSettings,
        });
        const dash = parseFloat(c.fontSize) * 9;
        t.style.strokeDasharray = dash;
        t.style.strokeDashoffset = dash;
        svg.appendChild(t);
        out.texts.push(t);
      });
      word.appendChild(svg);
      out.svgs.push(svg);
      out.chars.push(...chars);
    });
    gsap.set(out.chars, { opacity: 0 });
    return out;
  }

  /* =============================================================
     Marquee — direction follows scroll, speed follows velocity
     ============================================================= */
  function initMarquee() {
    const wrap = $(".marquee");
    if (!wrap) return;
    const rows = $$(".marquee__row", wrap).map((row) => {
      const track = $(".marquee__track", row);
      const copies = Math.max(2, Math.ceil((innerWidth * 2) / track.offsetWidth));
      for (let i = 1; i < copies; i++) row.appendChild(track.cloneNode(true));
      return { row, tracks: $$(".marquee__track", row), w: track.offsetWidth, x: 0, base: +row.dataset.dir || 1 };
    });
    window.addEventListener("resize", () => rows.forEach((r) => { r.w = r.tracks[0].offsetWidth; }));

    let visible = true;
    ScrollTrigger.create({ trigger: wrap, start: "top bottom", end: "bottom top", onToggle: (s) => (visible = s.isActive) });

    gsap.ticker.add((_, dt) => {
      if (!visible) return;
      const boost = Math.min(Math.abs(scroll.v) / 150, 8);
      rows.forEach((r) => {
        r.x -= (1 + boost) * r.base * scroll.dir * dt * 0.06;
        r.x = gsap.utils.wrap(-r.w, 0, r.x);
        r.tracks.forEach((t) => (t.style.transform = `translate3d(${r.x}px,0,0)`));
      });
    });
  }

  /* =============================================================
     Section helpers
     ============================================================= */
  function fadeUp(targets, trigger, opts = {}) {
    if (!targets || (Array.isArray(targets) && !targets.length)) return;
    gsap.from(targets, {
      y: 50, opacity: 0, duration: 1.2, ease: "power3.out", stagger: 0.08, ...opts,
      scrollTrigger: { trigger: trigger || targets, start: "top 86%", toggleActions: "play none none reverse" },
    });
  }
  // the rule above each section draws in, then its label rises
  function labelIn(section) {
    const label = $(".section-label", section);
    if (!label) return;
    gsap.fromTo(label, { "--rule": 0 }, { "--rule": 1, duration: 1.4, ease: "expo.out",
      scrollTrigger: { trigger: label, start: "top 88%", toggleActions: "play none none reverse" } });
    fadeUp(label, label, { y: 16, duration: 1 });
  }

  /* =============================================================
     About
     ============================================================= */
  function initAbout() {
    const sec = $("#about");
    labelIn(sec);

    const statement = $(".about__statement", sec);
    const words = new SplitText(statement, { type: "words", wordsClass: "w" }).words;
    if (finePointer) {
      gsap.fromTo(words, { opacity: 0.12 }, {
        opacity: 1, ease: "none", stagger: 0.1,
        scrollTrigger: { trigger: statement, start: "top 78%", end: "bottom 42%", scrub: true },
      });
    } else {
      // phones: one short reveal instead of re-painting every word on every scroll frame
      gsap.fromTo(words, { opacity: 0.12 }, {
        opacity: 1, duration: 0.6, ease: "power1.out", stagger: 0.025,
        scrollTrigger: { trigger: statement, start: "top 75%" },
      });
    }

    $$(".fade-up", sec).forEach((el) => fadeUp(el, el));
  }

  /* =============================================================
     Career — horizontal pinned track on wide screens
     ============================================================= */
  function initCareer() {
    const sec = $("#experience");
    labelIn(sec);
    const pin = $(".career__pin", sec);
    const track = $(".career__track", sec);
    const bar = $(".career__progress span", sec);
    const jobs = $$(".job", sec);

    const mm = gsap.matchMedia();
    mm.add("(min-width: 961px)", () => {
      sec.classList.add("is-horizontal");
      const dist = () => track.scrollWidth - innerWidth;
      let ticks = []; // filled below; markYear can run as soon as the trigger exists

      const moveTween = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: {
          trigger: pin, start: "top top", end: () => "+=" + dist(),
          pin: true, scrub: 1, refreshPriority: 1, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: (self) => { bar.style.transform = `scaleX(${self.progress})`; markYear(self.progress); },
        },
      });

      // Year ticks on the progress line: each sits at the scroll point where its job is centred.
      const st = moveTween.scrollTrigger;
      const years = document.createElement("ol");
      years.className = "career__years";
      ticks = jobs.map((job) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "career__tick";
        btn.textContent = $(".job__years", job).firstChild.textContent.trim();
        btn.setAttribute("aria-label", `Jump to ${$(".job__role", job).textContent} (${btn.textContent})`);
        btn.addEventListener("click", () => {
          const y = st.start + (st.end - st.start) * +btn.dataset.at;
          lenis ? lenis.scrollTo(y, { duration: 1.4 }) : window.scrollTo({ top: y, behavior: "smooth" });
        });
        li.appendChild(btn);
        years.appendChild(li);
        return { btn, job };
      });
      $(".career__progress", sec).appendChild(years);
      const placeTicks = () => {
        ticks.forEach(({ btn, job }) => {
          const centre = job.offsetLeft + job.offsetWidth / 2 - innerWidth * 0.45;
          const at = gsap.utils.clamp(0, 1, centre / Math.max(1, dist()));
          btn.dataset.at = at;
          btn.parentElement.style.left = (at * 100).toFixed(2) + "%";
        });
        markYear(st.progress);
      };
      function markYear(p) {
        let active = 0, best = Infinity;
        ticks.forEach(({ btn }, i) => {
          const d = Math.abs(p - +btn.dataset.at);
          if (d < best) { best = d; active = i; }
        });
        ticks.forEach(({ btn }, i) => btn.classList.toggle("is-active", i === active));
      }
      placeTicks();
      ScrollTrigger.addEventListener("refresh", placeTicks);
      jobs.forEach((job) => {
        gsap.from($$(".job__years, .job__date, .job__role, .job__org, li", job), {
          y: 60, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.06,
          scrollTrigger: { trigger: job, containerAnimation: moveTween, start: "left 85%", toggleActions: "play none none reverse" },
        });
      });

      return () => {
        sec.classList.remove("is-horizontal");
        years.remove();
        ScrollTrigger.removeEventListener("refresh", placeTicks);
      };
    });
    mm.add("(max-width: 960px)", () => {
      jobs.forEach((job) => fadeUp($$(".job__head, .job__role, .job__org", job), job, { stagger: 0.06 }));
    });
    // Phones: show years, role and company; the bullet points open on tap.
    mm.add("(max-width: 820px)", () => {
      const toggles = jobs.map((job, i) => {
        const list = $("ul", job);
        list.id ||= `job-details-${i}`;
        list.hidden = true;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "job__more";
        btn.setAttribute("aria-expanded", "false");
        btn.setAttribute("aria-controls", list.id);
        btn.innerHTML = 'Details <i aria-hidden="true">+</i>';
        btn.addEventListener("click", () => {
          const open = btn.getAttribute("aria-expanded") !== "true";
          btn.setAttribute("aria-expanded", String(open));
          gsap.killTweensOf(list);
          if (open) {
            list.hidden = false;
            gsap.fromTo(list, { height: 0, opacity: 0 }, {
              height: "auto", opacity: 1, duration: 0.5, ease: "power3.out",
              onComplete: () => { gsap.set(list, { clearProps: "height" }); ScrollTrigger.refresh(); },
            });
          } else {
            gsap.to(list, {
              height: 0, opacity: 0, duration: 0.35, ease: "power2.in",
              onComplete: () => { list.hidden = true; gsap.set(list, { clearProps: "height,opacity" }); ScrollTrigger.refresh(); },
            });
          }
        });
        $(".job__org", job).after(btn);
        return { btn, list };
      });
      return () => toggles.forEach(({ btn, list }) => {
        btn.remove();
        list.hidden = false;
        gsap.set(list, { clearProps: "height,opacity" });
      });
    });
  }

  /* =============================================================
     Theme flips — rosé for Skills, wine from Contact to the end
     ============================================================= */
  function initTheme() {
    const groups = {};
    $$("[data-theme]").forEach((el) => (groups[el.dataset.theme] ||= []).push(el));
    Object.entries(groups).forEach(([name, els]) => {
      const last = els[els.length - 1];
      const runsToEnd = last.matches(".footer"); // the closing theme holds until the very bottom
      ScrollTrigger.create({
        trigger: els[0], start: "top 55%",
        endTrigger: last, end: runsToEnd ? () => ScrollTrigger.maxScroll(window) + 10 : "bottom 45%",
        onToggle: (self) => document.body.classList.toggle(`theme-${name}`, self.isActive),
      });
    });
  }

  /* =============================================================
     Skills
     ============================================================= */
  function initExpertise() {
    const sec = $("#skills");
    labelIn(sec);
    ScrollTrigger.batch($$(".xlist__row", sec), {
      start: "top 90%",
      onEnter: (els) => gsap.fromTo(els, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "power3.out", stagger: 0.08, overwrite: true }),
    });
    gsap.set($$(".xlist__row", sec), { opacity: 0 });
    fadeUp($$(".tools__list li", sec), $(".tools", sec), { y: 30, stagger: 0.06 });
  }

  /* =============================================================
     Work — clip reveals and parallax tiles
     ============================================================= */
  function initWork() {
    const sec = $("#work");
    if (!sec) return; // section is commented out until real images exist
    labelIn(sec);

    const items = $$(".work__item", sec);
    items.forEach((item) => {
      const media = $(".work__media", item);
      gsap.fromTo(media, { clipPath: "inset(100% 0% 0% 0%)" }, {
        clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.out",
        scrollTrigger: { trigger: item, start: "top 88%", toggleActions: "play none none reverse" },
      });
      const speed = parseFloat(media.dataset.speed || 0);
      gsap.fromTo(media, { yPercent: speed * -100 }, {
        yPercent: speed * 100, ease: "none",
        scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true },
      });
      fadeUp($("figcaption", item), item, { y: 20, delay: 0.3 });
    });

  }

  /* =============================================================
     Education & languages
     ============================================================= */
  function initEducation() {
    const sec = $("#education");
    labelIn(sec);
    ScrollTrigger.batch($$(".row", sec), {
      start: "top 90%",
      onEnter: (els) => gsap.fromTo(els, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "power3.out", stagger: 0.1, overwrite: true }),
    });
    gsap.set($$(".row", sec), { opacity: 0 });

    const langs = $(".langs", sec);
    fadeUp($$("li", langs), langs, { y: 30, stagger: 0.1 });
    fadeUp($(".interests", sec), $(".interests", sec), { y: 30 });
  }

  /* =============================================================
     Contact
     ============================================================= */
  function initContact() {
    const sec = $("#contact");
    labelIn(sec);
    const mail = $(".contact__mail", sec);
    $$(".contact__line", mail).forEach((line, i) => {
      const chars = new SplitText(line, { type: "chars" }).chars;
      gsap.from(chars, {
        yPercent: 110, duration: 1.2, ease: "power4.out", stagger: 0.02, delay: i * 0.12,
        scrollTrigger: { trigger: mail, start: "top 85%", toggleActions: "play none none reverse" },
      });
    });
    fadeUp($(".contact__lead", sec), sec);
    fadeUp($$(".contact__details li", sec), $(".contact__details", sec), { stagger: 0.1 });
    fadeUp($$(".cform__field, .cform__submit", sec), $(".cform", sec), { stagger: 0.1 });
  }

  /* =============================================================
     Nav — hide on scroll down, active section, reveal after intro
     ============================================================= */
  function initNav() {
    const nav = $(".nav");
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: (self) => {
        const menuOpen = $(".nav__toggle").getAttribute("aria-expanded") === "true";
        nav.classList.toggle("is-hidden", !menuOpen && self.direction === 1 && self.scroll() > innerHeight * 0.5);
      },
    });
    $$(".nav__links a").forEach((a) => {
      const sec = $(a.getAttribute("href"));
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec, start: "top 50%", end: "bottom 50%",
        onToggle: (self) => a.classList.toggle("is-active", self.isActive),
      });
    });
  }

  /* =============================================================
     Mobile menu
     ============================================================= */
  function initMenu(lenis) {
    const btn = $(".nav__toggle");
    const menu = $("#menu");
    if (!btn || !menu) return;
    const links = $$(".menu__links a, .menu__foot > *", menu);
    let open = false;

    const set = (v) => {
      open = v;
      btn.setAttribute("aria-expanded", String(v));
      btn.setAttribute("aria-label", v ? "Close menu" : "Open menu");
      if (v) {
        menu.hidden = false;
        if (lenis) lenis.stop();
        document.body.style.overflow = "hidden";
        if (!reduce) {
          gsap.fromTo(menu, { clipPath: "circle(0% at 100% 0%)" }, { clipPath: "circle(150% at 100% 0%)", duration: 0.9, ease: "expo.inOut" });
          gsap.fromTo(links, { yPercent: 80, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: "power4.out", stagger: 0.05, delay: 0.3 });
        }
        links[0].focus({ preventScroll: true });
      } else {
        document.body.style.overflow = "";
        if (lenis) lenis.start();
        if (reduce) { menu.hidden = true; return; }
        gsap.to(menu, { clipPath: "circle(0% at 100% 0%)", duration: 0.7, ease: "expo.inOut", onComplete: () => (menu.hidden = true) });
      }
    };
    btn.addEventListener("click", () => set(!open));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && open) { set(false); btn.focus(); } });
  }

  /* ---------- In-page anchors through Lenis ---------- */
  function initAnchors(lenis) {
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.classList.contains("skip-link")) return;
      const id = a.getAttribute("href");
      const target = id === "#top" ? 0 : id.length > 1 && $(id);
      if (target === false || target === null) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.8 });
      else if (target === 0) window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
      if (id !== "#top") history.replaceState(null, "", id);
    });
  }

  /* =============================================================
     Custom cursor
     ============================================================= */
  function initCursor() {
    if (!finePointer) return;
    const cur = $(".cursor");
    const dot = $(".cursor__dot", cur);
    const ring = $(".cursor__ring", cur);
    root.classList.add("has-cursor");
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: -100, y: -100 });
    const dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3.out" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3.out" });

    window.addEventListener("pointermove", (e) => {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      cur.classList.remove("is-hidden");
    }, { passive: true });
    document.addEventListener("pointerleave", () => cur.classList.add("is-hidden"));
    document.addEventListener("pointerover", (e) => {
      cur.classList.toggle("is-hover", !!e.target.closest("a, button, input, textarea, .xlist__row"));
    });
    window.addEventListener("pointerdown", () => gsap.to(ring, { scale: 0.8, duration: 0.2 }));
    window.addEventListener("pointerup", () => gsap.to(ring, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" }));
  }

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    if (!finePointer) return;
    $$("[data-magnetic]").forEach((el) => {
      const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * 0.35);
        y((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("pointerleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.35)" }));
    });
  }

  /* =============================================================
     Small utilities
     ============================================================= */
  function initYear() {
    $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  }

  /* ---------- Copy email (for visitors without a mail app) ---------- */
  function initCopyEmail() {
    const btn = $(".contact__copy");
    if (!btn) return;
    const status = $(".contact__copied");
    btn.hidden = false;
    let t;
    btn.addEventListener("click", async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const tmp = Object.assign(document.createElement("textarea"), { value: text });
        tmp.style.cssText = "position:fixed;opacity:0";
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand("copy");
        tmp.remove();
      }
      status.textContent = "Copied to clipboard";
      clearTimeout(t);
      t = setTimeout(() => (status.textContent = ""), 2400);
    });
  }

  /* ---------- Contact form (FormSubmit AJAX) ---------- */
  function initContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    const status = form.querySelector(".cform__status");
    const btn = form.querySelector(".cform__submit");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      if (data.get("_honey")) return; // bot trap
      btn.disabled = true;
      status.classList.remove("error");
      status.textContent = "Sending…";
      try {
        const res = await fetch("https://formsubmit.co/ajax/milenaspajic@outlook.com", {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data,
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        status.textContent = "Thank you — your message is on its way. I'll get back to you soon!";
      } catch (err) {
        status.classList.add("error");
        status.textContent = "Something went wrong — please email me directly at milenaspajic@outlook.com.";
      }
      btn.disabled = false;
    });
  }
})();
