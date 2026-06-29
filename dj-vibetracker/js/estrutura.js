/* ============================================================
   estrutura.js — Épico 2
   Feature 2.1: Timestamp Sync (cronômetro de mapeamento)
   ============================================================ */

(() => {
  const MARKS = ["intro", "break", "drop", "outro"];

  // ---- Elementos ----
  const $clock = document.getElementById("mapClock");
  const $play  = document.getElementById("mapPlay");
  const $reset = document.getElementById("mapReset");

  if (!$clock) return; // seção não presente

  // mapa: marcador -> { input, valSpan, btn }
  const fields = {};
  MARKS.forEach((m) => {
    fields[m] = {
      input: document.getElementById("mark" + m.charAt(0).toUpperCase() + m.slice(1)),
      val: document.querySelector(`.markbtn__val[data-val="${m}"]`),
      btn: document.querySelector(`.markbtn[data-mark="${m}"]`),
    };
  });

  // ---- Estado do cronômetro ----
  let running = false;
  let startStamp = 0;   // performance.now() no início/retomada
  let elapsedBase = 0;  // ms acumulados antes da retomada atual
  let rafId = null;

  function elapsedMs() {
    return running ? elapsedBase + (performance.now() - startStamp) : elapsedBase;
  }

  /** Formata ms -> "mm:ss.d" (décimos) para o relógio. */
  function fmtClock(ms) {
    const totalSec = ms / 1000;
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    const d = Math.floor((ms % 1000) / 100);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${d}`;
  }

  /** Formata ms -> "min:seg" (usado nos campos/markers). */
  function fmtMarker(ms) {
    const totalSec = Math.round(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  // ---- Loop de render ----
  function tick() {
    $clock.textContent = fmtClock(elapsedMs());
    if (running) rafId = requestAnimationFrame(tick);
  }

  function start() {
    running = true;
    startStamp = performance.now();
    $play.textContent = "⏸ Pause";
    $play.classList.add("is-running");
    tick();
  }

  function pause() {
    elapsedBase = elapsedMs();
    running = false;
    cancelAnimationFrame(rafId);
    $play.textContent = "▶ Play";
    $play.classList.remove("is-running");
    $clock.textContent = fmtClock(elapsedBase);
  }

  function togglePlay() {
    running ? pause() : start();
  }

  function reset() {
    running = false;
    cancelAnimationFrame(rafId);
    elapsedBase = 0;
    startStamp = 0;
    $play.textContent = "▶ Play";
    $play.classList.remove("is-running");
    $clock.textContent = fmtClock(0);
  }

  // ---- Captura de marcador ----
  function setMark(mark) {
    const ms = elapsedMs();
    if (ms <= 0 && !running) {
      App.toast("Dê Play primeiro ▶");
      return;
    }
    const label = fmtMarker(ms);
    fields[mark].input.value = label;
    fields[mark].val.textContent = label;
    fields[mark].btn.classList.add("is-set");
    App.toast(`${mark.toUpperCase()} marcado em ${label}`);
  }

  // ---- Edição manual reflete no chip do botão ----
  function syncFromInput(mark) {
    const v = fields[mark].input.value.trim();
    fields[mark].val.textContent = v || "--:--";
    fields[mark].btn.classList.toggle("is-set", !!v);
  }

  // ---- Bind ----
  $play.addEventListener("click", togglePlay);
  $reset.addEventListener("click", reset);
  MARKS.forEach((m) => {
    fields[m].btn.addEventListener("click", () => setMark(m));
    fields[m].input.addEventListener("input", () => syncFromInput(m));
  });

  reset();
})();
