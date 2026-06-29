/* ============================================================
   app.js — Shell do app: navegação entre views + utilidades de UI
   ============================================================ */

const App = (() => {
  /* ---------- Navegação (bottom nav <-> views) ---------- */
  function navigateTo(target) {
    document.querySelectorAll(".view").forEach((v) => {
      v.hidden = v.dataset.view !== target;
    });
    document.querySelectorAll(".bottom-nav__item").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.target === target);
    });
    document.getElementById("appMain")?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function initNav() {
    document.getElementById("bottomNav")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".bottom-nav__item");
      if (btn) navigateTo(btn.dataset.target);
    });
  }

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function toast(msg, ms = 2400) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), ms);
  }

  /* ---------- Modo Cego (Feature 1.2 — toggle base já cabeado) ---------- */
  function initBlindMode() {
    const toggle = document.getElementById("blindModeToggle");
    if (!toggle) return;
    const saved = localStorage.getItem("djvibetracker.blindMode") === "1";
    toggle.checked = saved;
    document.body.classList.toggle("blind-mode", saved);
    toggle.addEventListener("change", () => {
      document.body.classList.toggle("blind-mode", toggle.checked);
      localStorage.setItem("djvibetracker.blindMode", toggle.checked ? "1" : "0");
      toast(toggle.checked ? "🙈 Modo Cego ativado" : "👁️ Modo Cego desativado");
    });
  }

  function init() {
    initNav();
    initBlindMode();
  }

  document.addEventListener("DOMContentLoaded", init);

  return { navigateTo, toast };
})();

window.App = App;
