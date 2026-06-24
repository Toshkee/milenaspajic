/* =============================================================
   MILENA SPAJIĆ — Portfolio · interaction & motion
   GSAP + ScrollTrigger + Lenis · progressive enhancement
   ============================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const isTouch = window.matchMedia("(hover: none)").matches;

  // If GSAP failed to load OR user prefers reduced motion → static, fully-visible site.
  if (!hasGSAP || reduce) {
    root.classList.add("no-enhance");
    initNav(null);
    initSkillsStatic();
    initLangStatic();
    initCountersStatic();
    return;
  }

  const gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);
  const ScrollTrigger = window.ScrollTrigger;

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (typeof window.Lenis !== "undefined" && !isTouch) {
    lenis = new window.Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  document.addEventListener("DOMContentLoaded", boot);
  if (document.readyState !== "loading") boot();
  let booted = false;
  function boot() {
    if (booted) return; booted = true;
    initNav(lenis);
    buildPetals();
    initHero();
    initReveals();
    initFlorals();
    initTimeline();
    initSkills();
    initLang();
    initCounters();
    initMagnetic();
    ScrollTrigger.refresh();

    // Keep trigger positions accurate as late assets (web fonts / images) change layout height
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", () => ScrollTrigger.refresh());
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 200); }, { passive: true });
    ScrollTrigger.addEventListener("refresh", () => { if (lenis && lenis.resize) lenis.resize(); });
  }

  /* ---------- Navigation ---------- */
  function initNav(lenis) {
    const nav = document.querySelector(".nav");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // mobile toggle — single source of truth for state + aria
    const toggle = nav.querySelector(".nav__toggle");
    const setMenu = (open) => {
      nav.classList.toggle("nav--open", open);
      if (toggle) {
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      }
    };
    if (toggle) toggle.addEventListener("click", () => setMenu(!nav.classList.contains("nav--open")));

    // smooth-scroll for in-page links
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

    // active link highlight (desktop + mobile)
    const links = [...document.querySelectorAll(".nav__links a, .nav__mobile a")];
    document.querySelectorAll("section[id]").forEach((sec) => {
      window.ScrollTrigger.create({
        trigger: sec, start: "top center", end: "bottom center",
        onToggle: (self) => {
          if (!self.isActive) return;
          links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + sec.id));
        },
      });
    });
  }

  /* ---------- Falling petals ---------- */
  function buildPetals() {
    const field = document.querySelector(".petal-field");
    if (!field || !document.getElementById("fl-petal")) return;
    const COUNT = window.innerWidth < 680 ? 8 : 16;
    for (let i = 0; i < COUNT; i++) {
      const wrap = document.createElement("div");
      wrap.className = "petal-fall";
      wrap.innerHTML = '<svg viewBox="0 0 60 80" aria-hidden="true"><use href="#fl-petal"/></svg>';
      field.appendChild(wrap);
      driftPetal(wrap, i);
    }
  }
  function driftPetal(el, i) {
    const w = window.innerWidth;
    const size = gsap.utils.random(14, 30);
    gsap.set(el, { left: gsap.utils.random(0, w), width: size, height: size * 1.35, opacity: 0 });
    const fall = () => {
      const dur = gsap.utils.random(9, 17);
      const startX = gsap.utils.random(-20, window.innerWidth);
      gsap.set(el, { left: startX, y: -60, opacity: 0, rotationZ: gsap.utils.random(0, 360) });
      gsap.timeline({ onComplete: fall })
        .to(el, { opacity: gsap.utils.random(0.45, 0.85), duration: 1.5 }, 0)
        .to(el, { y: window.innerHeight + 80, duration: dur, ease: "none" }, 0)
        .to(el, { x: gsap.utils.random(-120, 120), duration: dur, ease: "sine.inOut" }, 0)
        .to(el, { rotationZ: "+=" + gsap.utils.random(180, 540), duration: dur, ease: "none" }, 0)
        .to(el, { opacity: 0, duration: 2 }, dur - 2);
    };
    gsap.delayedCall(i * gsap.utils.random(0.3, 1.1), fall);
  }

  /* ---------- Hero intro ---------- */
  function initHero() {
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".hero__eyebrow", { y: 18, opacity: 0, duration: 0.7 })
      .from(".hero__name .ln > span", { yPercent: 115, duration: 1, stagger: 0.12, ease: "power4.out" }, "-=0.3")
      .from(".hero__role", { y: 20, opacity: 0, duration: 0.7 }, "-=0.5")
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
    // Bring in surrounding floral accents
    gsap.utils.toArray(".portrait .floral, .hero__f1, .hero__f2, .hero__f3").forEach((f, i) => {
      tl.to(f, { opacity: 1, scale: 1, rotate: 0, duration: 1.1, ease: "power2.out" }, 0.5 + i * 0.12);
      gsap.set(f, { scale: 0.6, rotate: -8 });
    });
  }

  /* ---------- Scroll reveals ---------- */
  function initReveals() {
    root.classList.add("reveal-ready");
    gsap.utils.toArray(".reveal").forEach((el) => {
      const d = parseFloat(el.dataset.delay || 0);
      gsap.fromTo(el,
        { y: 42, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: d,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
    });
    // staggered groups
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
    // bloom a flower at each role node
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
          immediateRender: false, // fallback state = visible (CSS) if trigger is missed
          scrollTrigger: { trigger: row, start: "top 92%", once: true },
        });
    });
  }
  function initLangStatic() { /* dots already styled via .on class */ }

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
})();
