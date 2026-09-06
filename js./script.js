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

// Ocean parallax: background layers drift at different speeds as the
// page scrolls, giving the sea a sense of depth. Skipped entirely for
// visitors who've asked for reduced motion.
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
