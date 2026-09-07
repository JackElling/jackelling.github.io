(() => {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Tunables — flip this to false to remove the cursor dust entirely.   */
  /* ------------------------------------------------------------------ */
  const ENABLE_CURSOR_DUST = true;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ------------------------------------------------------------------ */
  /* 1. Compass rim ticks — 32-point rim drawn once, procedurally.        */
  /* ------------------------------------------------------------------ */
  function drawCompassTicks() {
    const group = document.getElementById("tickGroup");
    if (!group) return;
    const SVG_NS = "http://www.w3.org/2000/svg";
    const cx = 110, cy = 110, rOuter = 96, rInner = 90;
    for (let i = 0; i < 32; i++) {
      const angle = (i * 360) / 32;
      const rad = (angle * Math.PI) / 180;
      const isMajor = i % 4 === 0;
      const r1 = isMajor ? rInner - 6 : rInner;
      const x1 = cx + r1 * Math.sin(rad);
      const y1 = cy - r1 * Math.cos(rad);
      const x2 = cx + rOuter * Math.sin(rad);
      const y2 = cy - rOuter * Math.cos(rad);
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("x1", x1.toFixed(1));
      line.setAttribute("y1", y1.toFixed(1));
      line.setAttribute("x2", x2.toFixed(1));
      line.setAttribute("y2", y2.toFixed(1));
      line.setAttribute("class", "tick");
      group.appendChild(line);
    }
  }

  /* ------------------------------------------------------------------ */
  /* 2. Scroll hint button                                               */
  /* ------------------------------------------------------------------ */
  function wireScrollHint() {
    const btn = document.querySelector("[data-scroll-to]");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.getAttribute("data-scroll-to"));
      if (target) {
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* 3. Cursor dust — a faint trail of parchment/ink specks that drift    */
  /*    and settle behind the pointer. Fine-pointer devices only, and     */
  /*    skipped entirely for reduced-motion or touch.                     */
  /* ------------------------------------------------------------------ */
  function initCursorDust() {
    const canvas = document.getElementById("dust-canvas");
    if (!canvas) return;

    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!ENABLE_CURSOR_DUST || prefersReducedMotion || !hasFinePointer) {
      canvas.remove();
      return;
    }

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const speckColors = ["#A8793D", "#2A1B12", "#6F0000"];
    let particles = [];
    let lastSpawn = 0;
    let lastX = null, lastY = null;

    function spawn(x, y) {
      const count = 1 + Math.round(Math.random());
      for (let i = 0; i < count; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.25,
          vy: 0.15 + Math.random() * 0.35,
          r: 0.6 + Math.random() * 1.3,
          life: 0,
          maxLife: 500 + Math.random() * 400,
          color: speckColors[Math.floor(Math.random() * speckColors.length)],
          alpha: 0.18 + Math.random() * 0.14,
        });
      }
      if (particles.length > 140) particles.splice(0, particles.length - 140);
    }

    function onMove(e) {
      const now = performance.now();
      const x = e.clientX;
      const y = e.clientY;
      if (lastX !== null) {
        const dist = Math.hypot(x - lastX, y - lastY);
        if (dist < 4) return;
      }
      if (now - lastSpawn > 28) {
        spawn(x, y);
        lastSpawn = now;
      }
      lastX = x;
      lastY = y;
    }
    window.addEventListener("mousemove", onMove, { passive: true });

    let lastFrame = performance.now();
    function tick(now) {
      const dt = Math.min(now - lastFrame, 48);
      lastFrame = now;
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx * (dt / 16.6);
        p.y += p.vy * (dt / 16.6);
        const t = p.life / p.maxLife;
        const fade = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
        ctx.globalAlpha = Math.max(0, fade) * p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    drawCompassTicks();
    wireScrollHint();
    initCursorDust();
  });
})();
