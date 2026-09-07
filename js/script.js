// Lamp toggle: switches between the parchment (day) and ink (night)
// charts, remembering the choice in localStorage.
(function () {
  const root = document.documentElement;
  const STORAGE_KEY = "site-theme";

  function applyTheme(theme) {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function updateButtonLabel(button) {
    button.textContent =
      currentTheme() === "dark" ? "Light the lamp" : "Trim the lamp";
  }

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) applyTheme(saved);

  document.addEventListener("DOMContentLoaded", function () {
    const button = document.querySelector("[data-lamp-toggle]");
    if (button) {
      updateButtonLabel(button);
      button.addEventListener("click", function () {
        const next = currentTheme() === "dark" ? "light" : "dark";
        applyTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
        updateButtonLabel(button);
      });
    }
  });
})();

// Ocean parallax: wave layers drift at different speeds as the page
// scrolls, giving the sea a sense of depth. Skipped for visitors who
// have asked for reduced motion.
(function () {
  function initParallax() {
    const layers = document.querySelectorAll(".ocean-layer[data-speed]");
    if (!layers.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;

    function update() {
      const y = window.scrollY;
      layers.forEach(function (layer) {
        const speed = parseFloat(layer.dataset.speed);
        layer.style.transform = "translate3d(0, " + y * speed + "px, 0)";
      });
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();
  }

  document.addEventListener("DOMContentLoaded", initParallax);
})();

// Graticule: a lat/long grid drawn as live SVG lines that bow away
// from the cursor, like a chart flexing under a fingertip. Falls back
// to a plain straight grid on touch-only devices and for anyone who
// has asked for reduced motion.
(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const SPACING_X = 170;
  const SPACING_Y = 130;
  const STEP = 26;
  const RADIUS = 170;
  const STRENGTH = 36;

  function initGraticule() {
    const container = document.querySelector(".ocean-scene");
    const svg = document.querySelector(".graticule-svg");
    if (!container || !svg) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = 0;
    let height = 0;
    let lines = [];
    let mouseX = -9999;
    let mouseY = -9999;
    let rafPending = false;

    function buildGrid() {
      width = window.innerWidth;
      height = window.innerHeight;
      svg.setAttribute("viewBox", "0 0 " + width + " " + height);
      svg.innerHTML = "";
      lines = [];

      for (let y = -SPACING_Y; y <= height + SPACING_Y; y += SPACING_Y) {
        const pts = [];
        for (let x = -40; x <= width + 40; x += STEP) {
          pts.push({ baseX: x, baseY: y });
        }
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("class", "graticule-line");
        svg.appendChild(path);
        lines.push({ pts: pts, path: path });
      }

      for (let x = -SPACING_X; x <= width + SPACING_X; x += SPACING_X) {
        const pts = [];
        for (let y = -40; y <= height + 40; y += STEP) {
          pts.push({ baseX: x, baseY: y });
        }
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("class", "graticule-line");
        svg.appendChild(path);
        lines.push({ pts: pts, path: path });
      }

      render();
    }

    function render() {
      lines.forEach(function (line) {
        let d = "";
        line.pts.forEach(function (p, i) {
          let x = p.baseX;
          let y = p.baseY;
          const dx = p.baseX - mouseX;
          const dy = p.baseY - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < RADIUS && dist > 0.01) {
            const falloff = 1 - dist / RADIUS;
            const push = falloff * falloff * STRENGTH;
            x += (dx / dist) * push;
            y += (dy / dist) * push;
          }
          d += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1) + " ";
        });
        line.path.setAttribute("d", d);
      });
      rafPending = false;
    }

    function scheduleRender() {
      if (!rafPending) {
        rafPending = true;
        window.requestAnimationFrame(render);
      }
    }

    buildGrid();

    let resizeTimer;
    window.addEventListener(
      "resize",
      function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(buildGrid, 150);
      },
      { passive: true }
    );

    if (!reduceMotion) {
      window.addEventListener(
        "mousemove",
        function (e) {
          mouseX = e.clientX;
          mouseY = e.clientY;
          scheduleRender();
        },
        { passive: true }
      );
      window.addEventListener(
        "mouseleave",
        function () {
          mouseX = -9999;
          mouseY = -9999;
          scheduleRender();
        },
        { passive: true }
      );
      window.addEventListener(
        "touchmove",
        function (e) {
          if (e.touches && e.touches[0]) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
            scheduleRender();
          }
        },
        { passive: true }
      );
    }
  }

  document.addEventListener("DOMContentLoaded", initGraticule);
})();
