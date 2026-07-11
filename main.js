/* =============================================================
   MILENA SPAJIĆ — Portfolio · interaction & motion
   GSAP 3.13 + ScrollTrigger + SplitText + Lenis (via npm/Vite)
   Canvas petal field · cinematic intro
   Progressive enhancement — static site if motion unavailable
   ============================================================= */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

(function () {
  "use strict";

  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none)").matches;

  gsap.registerPlugin(ScrollTrigger, SplitText);
  const hasSplit = true;

  // Reduced motion → static, fully-visible site.
  if (reduce) {
    root.classList.add("no-enhance");
    const pre = document.querySelector(".preloader");
    if (pre) pre.remove();
    initNav(null);
    initSkillsStatic();
    initCountersStatic();
    initContactForm();
    return;
  }

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  let scrollVelocity = 0; // fed to the petal field as wind gusts
  if (!isTouch) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", (e) => { scrollVelocity = e.velocity || 0; ScrollTrigger.update(); });
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    let lastY = window.scrollY, lastT = performance.now();
    window.addEventListener("scroll", () => {
      const now = performance.now();
      scrollVelocity = (window.scrollY - lastY) / Math.max(now - lastT, 1) * 16;
      lastY = window.scrollY; lastT = now;
    }, { passive: true });
  }

  let booted = false;
  document.addEventListener("DOMContentLoaded", boot);
  if (document.readyState !== "loading") boot();
  function boot() {
    if (booted) return; booted = true;

    initNav(lenis);
    initProgressBar();
    initPetalCanvas();
    initReveals();
    initFlorals();
    initHeroMouseParallax();
    initHeroExit();
    initTimeline();
    initSkills();
    initLang();
    initCounters();
    initMagnetic();
    initTilt();
    initContactForm();

    // Text splitting waits for webfonts so measurements are correct.
    const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    const ready = Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1800))]);
    ready.then(() => {
      const heroTl = initHero(); // paused — released by the preloader
      initTitles();
      initPreloader(() => { if (heroTl) heroTl.play(); });
      ScrollTrigger.refresh();
    });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", () => ScrollTrigger.refresh());
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 200); }, { passive: true });
    ScrollTrigger.addEventListener("refresh", () => { if (lenis && lenis.resize) lenis.resize(); });
  }

  /* ---------- Preloader curtain ---------- */
  function initPreloader(onDone) {
    const pre = document.querySelector(".preloader");
    if (!pre) { onDone(); return; }
    if (lenis) lenis.stop();
    document.body.classList.add("is-loading");

    const name = pre.querySelector(".preloader__name");
    const line = pre.querySelector(".preloader__line");
    const tag = pre.querySelector(".preloader__tag");
    const panels = pre.querySelectorAll(".preloader__panel");

    let chars = [name];
    if (hasSplit && name) {
      chars = new SplitText(name, { type: "chars", charsClass: "pre-ch" }).chars;
    }

    const finish = () => {
      pre.classList.add("done");
      pre.remove();
      document.body.classList.remove("is-loading");
      if (lenis) lenis.start();
      // honor deep links (…/#section) that the scroll lock swallowed
      if (location.hash) {
        const target = document.querySelector(location.hash);
        if (target) {
          if (lenis) lenis.scrollTo(target, { offset: -70, immediate: true });
          else target.scrollIntoView();
        }
      }
      onDone();
    };
    // Hard safety: never trap the visitor behind the curtain.
    const safety = setTimeout(finish, 5000);

    gsap.timeline({ onComplete: () => { clearTimeout(safety); finish(); } })
      .set(pre, { autoAlpha: 1 })
      .from(chars, { yPercent: 120, rotate: 6, duration: 0.9, ease: "power4.out", stagger: 0.045 }, 0.15)
      .fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power3.inOut" }, 0.55)
      .from(tag, { y: 14, opacity: 0, duration: 0.6, ease: "power3.out" }, 0.85)
      .to({}, { duration: 0.45 }) // hold
      .to(chars, { yPercent: -120, duration: 0.55, ease: "power3.in", stagger: 0.02 }, ">-0.1")
      .to([line, tag], { opacity: 0, duration: 0.35 }, "<")
      .to(panels, { yPercent: -100, duration: 0.9, ease: "power4.inOut", stagger: 0.12 }, ">-0.15");
  }

  /* ---------- Navigation ---------- */
  function initNav(lenis) {
    const nav = document.querySelector(".nav");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const toggle = nav.querySelector(".nav__toggle");
    const setMenu = (open) => {
      nav.classList.toggle("nav--open", open);
      if (toggle) {
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      }
    };
    if (toggle) toggle.addEventListener("click", () => setMenu(!nav.classList.contains("nav--open")));

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        setMenu(false);
        if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.2 });
        else target.scrollIntoView({ behavior: "smooth" });
      });
    });

    const links = [...document.querySelectorAll(".nav__links a, .nav__mobile a")];
    {
      document.querySelectorAll("section[id]").forEach((sec) => {
        ScrollTrigger.create({
          trigger: sec, start: "top center", end: "bottom center",
          onToggle: (self) => {
            if (!self.isActive) return;
            links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + sec.id));
          },
        });
      });
    }
  }

  /* ---------- Scroll progress bar ---------- */
  function initProgressBar() {
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    gsap.set(bar, { scaleX: 0, transformOrigin: "0 50%" });
    gsap.to(bar, {
      scaleX: 1, ease: "none",
      scrollTrigger: { trigger: document.body, start: "top top", end: "max", scrub: 0.3 },
    });
  }

  /* ---------- Petal field (canvas · wind · scroll gusts) ---------- */
  function initPetalCanvas() {
    const field = document.querySelector(".petal-field");
    if (!field) return;
    const canvas = document.createElement("canvas");
    field.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // blush → rose → gold pairs, weighted toward the light end
    const PALETTE = [
      ["#FCE3EA", "#F7C9D6"], ["#F7C9D6", "#E891A9"], ["#F7C9D6", "#E891A9"],
      ["#E891A9", "#DE5C82"], ["#DE5C82", "#D6336C"], ["#E7D4B0", "#C8A062"],
    ];
    const rand = (a, b) => a + Math.random() * (b - a);
    const COUNT = W < 680 ? 22 : 46;
    const petals = [];

    function spawn(p, anywhere) {
      p.z = rand(0.35, 1);                       // depth: scale, speed, opacity
      p.size = rand(9, 20) * p.z;
      p.x = rand(-40, W + 40);
      p.y = anywhere ? rand(-H * 0.1, H) : rand(-140, -30);
      p.vy = rand(22, 44) * p.z;                 // px/s fall speed
      p.vx = 0;
      p.swayAmp = rand(18, 60);
      p.swayFreq = rand(0.25, 0.6);
      p.phase = rand(0, Math.PI * 2);
      p.rot = rand(0, Math.PI * 2);
      p.rotV = rand(-0.8, 0.8);
      p.tumble = rand(0, Math.PI * 2);
      p.tumbleV = rand(0.6, 1.8);
      p.alpha = rand(0.5, 0.9) * (0.45 + p.z * 0.55);
      p.colors = PALETTE[(Math.random() * PALETTE.length) | 0];
      return p;
    }
    for (let i = 0; i < COUNT; i++) petals.push(spawn({}, true));

    // pointer wind
    let mx = -9999, my = -9999, pmx = -9999, pmy = -9999, windX = 0, windY = 0;
    window.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

    function drawPetal(p) {
      const s = p.size;
      const squish = 0.35 + 0.65 * Math.abs(Math.cos(p.tumble)); // 3D flip illusion
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(squish, 1);
      ctx.globalAlpha = p.alpha;
      const g = ctx.createLinearGradient(0, -s, 0, s);
      g.addColorStop(0, p.colors[0]);
      g.addColorStop(1, p.colors[1]);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.85, -s * 0.6, s * 0.7, s * 0.55, 0, s);
      ctx.bezierCurveTo(-s * 0.7, s * 0.55, -s * 0.85, -s * 0.6, 0, -s);
      ctx.fill();
      ctx.restore();
    }

    let paused = false;
    document.addEventListener("visibilitychange", () => { paused = document.hidden; });

    gsap.ticker.add((time, deltaMS) => {
      if (paused) return;
      const dt = Math.min(deltaMS / 1000, 0.05);
      ctx.clearRect(0, 0, W, H);

      // pointer velocity → decaying wind vector
      if (pmx > -9998) { windX += (mx - pmx) * 0.35; windY += (my - pmy) * 0.35; }
      pmx = mx; pmy = my;
      windX *= 0.88; windY *= 0.88;
      const gust = gsap.utils.clamp(-40, 40, scrollVelocity * 1.6);
      scrollVelocity *= 0.94;

      for (const p of petals) {
        // gentle sway + cursor wind (falls off with distance) + scroll gust
        const sway = Math.sin(time * p.swayFreq * Math.PI * 2 + p.phase) * p.swayAmp;
        const ddx = p.x - mx, ddy = p.y - my;
        const dist2 = ddx * ddx + ddy * ddy;
        const influence = Math.min(1, 26000 / (dist2 + 1400)) * p.z;
        p.vx += (windX * influence) * dt * 14;
        p.vy += (windY * influence) * dt * 9;
        p.vx *= 0.965;
        p.vy += (rand(22, 44) * p.z - p.vy) * dt * 0.8; // relax toward natural fall
        p.x += (p.vx + sway * dt) * 1;
        p.x += sway * dt * 0.4;
        p.y += (p.vy - gust) * dt;
        p.rot += (p.rotV + p.vx * 0.002) * dt * 2;
        p.tumble += p.tumbleV * dt;

        if (p.y > H + 60 || p.x < -120 || p.x > W + 120) spawn(p, false);
        if (p.y < -160) { p.y = H + 40; }
        drawPetal(p);
      }
    });
  }

  /* ---------- Hero intro (paused; released by preloader) ---------- */
  function initHero() {
    const hero = document.querySelector(".hero");
    if (!hero) return null;
    const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

    tl.from(".hero__eyebrow", { y: 18, opacity: 0, duration: 0.7 });

    // Split the name into characters for a masked cascade
    const lineSpans = document.querySelectorAll(".hero__name .ln > span");
    if (hasSplit && lineSpans.length) {
      const split = new SplitText(lineSpans, { type: "chars", charsClass: "hero-ch" });
      tl.from(split.chars, {
        yPercent: 130, rotate: 8, duration: 1.1, ease: "power4.out", stagger: 0.04,
      }, "-=0.3");
    } else {
      tl.from(".hero__name .ln > span", { yPercent: 115, duration: 1, stagger: 0.12, ease: "power4.out" }, "-=0.3");
    }

    tl.from(".hero__role", { y: 20, opacity: 0, duration: 0.7 }, "-=0.6")
      .from(".hero__meta span", { y: 14, opacity: 0, duration: 0.5, stagger: 0.08 }, "-=0.4")
      .from(".hero__actions > *", { y: 18, opacity: 0, duration: 0.6, stagger: 0.1 }, "-=0.35")
      .from(".portrait__frame", { scale: 0.9, opacity: 0, duration: 1.1, ease: "power3.out" }, 0.2)
      .from(".portrait__ring", { scale: 1.1, opacity: 0, duration: 1.2 }, 0.4)
      .from(".scroll-cue", { opacity: 0, y: 12, duration: 0.8 }, "-=0.4");

    // Bloom the inline hero rose petal-by-petal
    const rosePetals = document.querySelectorAll("#hero-rose .petal");
    if (rosePetals.length) {
      gsap.set("#hero-rose", { opacity: 1 });
      tl.from(rosePetals, {
        scale: 0, transformOrigin: "50% 70%", opacity: 0,
        rotation: -22, duration: 0.9, ease: "back.out(1.7)", stagger: 0.05,
      }, 0.3);
    }
    // Draw the champagne veins on after the bloom
    const veins = document.querySelectorAll("#hero-rose .veins path");
    veins.forEach((v) => {
      const len = v.getTotalLength();
      gsap.set(v, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(v, { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" }, 1.1);
    });
    // Bring in surrounding floral accents
    gsap.utils.toArray(".portrait .floral, .hero__f1, .hero__f2, .hero__f3").forEach((f, i) => {
      tl.to(f, { opacity: 1, scale: 1, rotate: 0, duration: 1.1, ease: "power2.out" }, 0.5 + i * 0.12);
      gsap.set(f, { scale: 0.6, rotate: -8 });
    });
    return tl;
  }

  /* ---------- Hero mouse parallax ---------- */
  function initHeroMouseParallax() {
    if (isTouch) return;
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const layers = [
      { el: ".hero__f1", depth: 26 }, { el: ".hero__f2", depth: -18 }, { el: ".hero__f3", depth: 14 },
      { el: ".portrait__frame", depth: 10 }, { el: ".portrait__ring", depth: -14 },
      { el: ".portrait__f-tl", depth: 22 }, { el: ".portrait__f-br", depth: -16 }, { el: ".portrait__f-bud", depth: 18 },
    ].map((l) => {
      const el = document.querySelector(l.el);
      return el ? {
        depth: l.depth,
        x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
      } : null;
    }).filter(Boolean);

    hero.addEventListener("pointermove", (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      layers.forEach((l) => { l.x(nx * l.depth); l.y(ny * l.depth * 0.6); });
    }, { passive: true });
    hero.addEventListener("pointerleave", () => layers.forEach((l) => { l.x(0); l.y(0); }));
  }

  /* ---------- Hero scroll exit ---------- */
  function initHeroExit() {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    gsap.to(".hero__grid", {
      yPercent: -10, opacity: 0.15, scale: 0.965, ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom 25%", scrub: true },
    });
    gsap.to(".scroll-cue", {
      opacity: 0, ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "18% top", scrub: true },
    });
  }

  /* ---------- Section titles: masked line reveals ---------- */
  function initTitles() {
    const titles = gsap.utils.toArray(".section-title, .contact__title");
    titles.forEach((t) => {
      // gold shimmer sweep across the italic accent — applied to the split word
      // spans themselves (background-clip:text doesn't paint into transformed children)
      ScrollTrigger.create({
        trigger: t, start: "top 80%", once: true,
        onEnter: () => t.querySelectorAll("em").forEach((em) => {
          const words = em.querySelectorAll(".st-word");
          (words.length ? words : [em]).forEach((w) => w.classList.add("shimmer"));
        }),
      });
      if (!hasSplit) return;
      const split = new SplitText(t, { type: "lines,words", linesClass: "st-line", wordsClass: "st-word" });
      gsap.from(split.words, {
        yPercent: 120, rotate: 3, duration: 1, ease: "power4.out", stagger: 0.06,
        scrollTrigger: { trigger: t, start: "top 84%", once: true },
      });
      // its .section-head wrapper skipped the block reveal — bring the eyebrow in here
      const head = t.closest(".section-head");
      const eyebrow = head && head.querySelector(".eyebrow");
      if (eyebrow) {
        gsap.from(eyebrow, {
          y: 18, opacity: 0, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: t, start: "top 84%", once: true },
        });
      }
    });
  }

  /* ---------- Scroll reveals ---------- */
  function initReveals() {
    root.classList.add("reveal-ready");
    gsap.utils.toArray(".reveal").forEach((el) => {
      // section headers animate word-by-word in initTitles instead —
      // drop the class so the CSS `.reveal { opacity: 0 }` doesn't hide them
      if (hasSplit && el.classList.contains("section-head") && el.querySelector(".section-title")) {
        el.classList.remove("reveal");
        return;
      }
      const d = parseFloat(el.dataset.delay || 0);
      gsap.fromTo(el,
        { y: 42, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: d,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
    });
    gsap.utils.toArray("[data-reveal-group]").forEach((group) => {
      const kids = group.children;
      gsap.fromTo(kids,
        { y: 36, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.09,
          scrollTrigger: { trigger: group, start: "top 82%", once: true },
        });
    });
  }

  /* ---------- Floating + parallax florals ---------- */
  function initFlorals() {
    gsap.utils.toArray(".floral").forEach((f, i) => {
      if (f.closest(".portrait") || f.classList.contains("hero__f1") ||
          f.classList.contains("hero__f2") || f.classList.contains("hero__f3")) {
        // hero ones handled in intro; still give idle float below
      } else {
        gsap.to(f, { opacity: 1, duration: 1.2,
          scrollTrigger: { trigger: f.closest("section") || f, start: "top 88%", once: true } });
      }
      // idle drift
      gsap.to(f, {
        y: "+=14", rotation: "+=4", duration: gsap.utils.random(4, 7),
        ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * 0.2,
      });
      // scroll parallax
      const speed = parseFloat(f.dataset.speed || 0);
      if (speed) {
        gsap.to(f, {
          yPercent: speed * 100, ease: "none",
          scrollTrigger: { trigger: f.closest("section") || f, start: "top bottom", end: "bottom top", scrub: true },
        });
      }
    });
  }

  /* ---------- Experience timeline (growing vine) ---------- */
  function initTimeline() {
    const section = document.querySelector("#experience");
    if (!section) return;
    const vine = document.getElementById("vine-stem-main");
    const timelineEl = section.querySelector(".timeline") || section;
    if (vine) {
      const len = vine.getTotalLength();
      gsap.set(vine, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(vine, {
        strokeDashoffset: 0, ease: "none",
        scrollTrigger: { trigger: timelineEl, start: "top 70%", end: "bottom 70%", scrub: 0.6 },
      });
    }
    gsap.utils.toArray(".vine-node").forEach((n) => {
      gsap.fromTo(n,
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1, transformOrigin: "50% 50%", duration: 0.6, ease: "back.out(2)",
          scrollTrigger: { trigger: n, start: "top 85%", once: true },
        });
    });
    gsap.utils.toArray(".tl-item__node").forEach((node) => {
      gsap.fromTo(node,
        { scale: 0, rotation: -40, opacity: 0 },
        {
          scale: 1, rotation: 0, opacity: 1, duration: 0.9, ease: "back.out(1.7)", transformOrigin: "50% 50%",
          scrollTrigger: { trigger: node.closest(".tl-item"), start: "top 72%", once: true },
        });
    });
  }

  /* ---------- Skills bars ---------- */
  function initSkills() {
    gsap.utils.toArray(".skill__fill").forEach((bar) => {
      const lvl = parseFloat(bar.dataset.level || 80);
      gsap.fromTo(bar, { width: "0%" }, {
        width: lvl + "%", duration: 1.3, ease: "power3.out",
        scrollTrigger: { trigger: bar, start: "top 90%", once: true },
      });
    });
  }
  function initSkillsStatic() {
    document.querySelectorAll(".skill__fill").forEach((b) => { b.style.width = (b.dataset.level || 80) + "%"; });
  }
  function initCountersStatic() {
    document.querySelectorAll("[data-count]").forEach((el) => { el.textContent = el.dataset.count + (el.dataset.suffix || ""); });
  }

  /* ---------- Language dots ---------- */
  function initLang() {
    gsap.utils.toArray(".lang__row").forEach((row) => {
      const dots = row.querySelectorAll(".lang__dot.on");
      gsap.fromTo(dots,
        { scale: 0, opacity: 0 },
        {
          scale: 1, opacity: 1, duration: 0.5, stagger: 0.09, ease: "back.out(2)", transformOrigin: "50% 50%",
          immediateRender: false,
          scrollTrigger: { trigger: row, start: "top 92%", once: true },
        });
    });
  }

  /* ---------- Count-up stats ---------- */
  function initCounters() {
    gsap.utils.toArray("[data-count]").forEach((el) => {
      const end = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || "";
      const obj = { v: 0 };
      gsap.to(obj, {
        v: end, duration: 1.6, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
      });
    });
  }

  /* ---------- Magnetic buttons ---------- */
  function initMagnetic() {
    if (isTouch) return;
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.35;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        gsap.to(el, { x, y, duration: 0.5, ease: "power3.out" });
      });
      el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" }));
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

  /* ---------- 3D tilt with glare (gallery + portrait) ---------- */
  function initTilt() {
    if (isTouch) return;
    document.querySelectorAll(".gallery__item, .portrait__frame").forEach((el) => {
      el.classList.add("tilt");
      const glare = document.createElement("div");
      glare.className = "tilt__glare";
      glare.setAttribute("aria-hidden", "true");
      el.appendChild(glare);

      const rX = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power2.out" });
      const rY = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power2.out" });
      gsap.set(el, { transformPerspective: 700 });

      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        rX(-ny * 10); rY(nx * 12);
        glare.style.setProperty("--gx", ((nx + 0.5) * 100).toFixed(1) + "%");
        glare.style.setProperty("--gy", ((ny + 0.5) * 100).toFixed(1) + "%");
        glare.style.opacity = "1";
      });
      el.addEventListener("pointerleave", () => {
        rX(0); rY(0);
        glare.style.opacity = "0";
      });
    });
  }
})();
