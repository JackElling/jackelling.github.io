// Small "lamp" toggle: switches between paper (light) and ink (dark) themes
// and remembers the choice in localStorage.

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
      currentTheme() === "dark" ? "Turn the lamp on" : "Turn the lamp off";
  }

  // Apply saved preference as early as possible
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) applyTheme(saved);

  document.addEventListener("DOMContentLoaded", function () {
    const button = document.querySelector("[data-lamp-toggle]");
    if (!button) return;

    updateButtonLabel(button);

    button.addEventListener("click", function () {
      const next = currentTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
      updateButtonLabel(button);
    });
  });
})();
