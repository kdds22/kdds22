/* ============================================================
   taptempo.js — Feature 1.1: Tap Tempo (Calculadora de BPM)
   Regra: captura timestamps dos toques, calcula a média dos
   deltas dos últimos 4–8 toques e converte: BPM = 60000 / médiaMs.
   ============================================================ */

(() => {
  const MAX_TAPS = 8;        // janela máxima considerada na média
  const MIN_TAPS_FOR_BPM = 4; // spec: média dos últimos 4 a 8 toques
  const RESET_TIMEOUT_MS = 2500; // inatividade que zera a contagem

  let taps = [];             // timestamps (ms) dos toques recentes
  let currentBpm = null;     // último BPM calculado
  let idleTimer = null;

  // ---- Elementos ----
  const $bpm       = document.getElementById("tapBpm");
  const $count     = document.getElementById("tapCount");
  const $stability = document.getElementById("tapStability");
  const $pad       = document.getElementById("tapPad");
  const $reset     = document.getElementById("tapReset");
  const $use       = document.getElementById("tapUse");
  const $feedback  = document.getElementById("tapFeedback");

  if (!$pad) return; // guarda: seção não presente

  /* ---------- Cálculo ---------- */
  function computeBpm() {
    if (taps.length < MIN_TAPS_FOR_BPM) return null;

    // deltas entre toques consecutivos (já limitados a MAX_TAPS toques)
    const deltas = [];
    for (let i = 1; i < taps.length; i++) deltas.push(taps[i] - taps[i - 1]);

    const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    if (avg <= 0) return null;

    const bpm = 60000 / avg;
    // faixa sensata para música eletrônica/club
    if (bpm < 40 || bpm > 300) return null;

    return { bpm: Math.round(bpm), deltas, avg };
  }

  /* ---------- Estabilidade (consistência dos toques) ---------- */
  function stabilityLabel(deltas, avg) {
    if (!deltas || deltas.length < 2) return "continue tocando…";
    // desvio padrão relativo
    const variance = deltas.reduce((s, d) => s + (d - avg) ** 2, 0) / deltas.length;
    const cv = Math.sqrt(variance) / avg; // coeficiente de variação
    if (cv < 0.04) return "🎯 muito estável";
    if (cv < 0.09) return "👍 estável";
    if (cv < 0.16) return "≈ razoável";
    return "🌀 instável — toque no ritmo";
  }

  /* ---------- Render ---------- */
  function render() {
    $count.textContent = taps.length;

    const result = computeBpm();
    if (result) {
      currentBpm = result.bpm;
      $bpm.textContent = result.bpm;
      $stability.textContent = stabilityLabel(result.deltas, result.avg);
      $use.disabled = false;
    } else {
      currentBpm = null;
      if (taps.length === 0) {
        $bpm.textContent = "--";
        $stability.textContent = "aguardando…";
      } else {
        // ainda não atingiu o mínimo de toques para uma média confiável
        const restantes = MIN_TAPS_FOR_BPM - taps.length;
        $bpm.textContent = "…";
        $stability.textContent = `faltam ${restantes} toque${restantes > 1 ? "s" : ""}…`;
      }
      $use.disabled = true;
    }
  }

  /* ---------- Toque ---------- */
  function handleTap() {
    const now = performance.now();
    taps.push(now);
    if (taps.length > MAX_TAPS) taps.shift(); // mantém janela deslizante

    // feedback visual do pad
    $pad.classList.add("is-tapped");
    setTimeout(() => $pad.classList.remove("is-tapped"), 90);

    // reinicia timer de inatividade
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      // após inatividade, congela o valor mas limpa a janela
      // (próximo toque inicia uma nova medição)
      taps = [];
      $count.textContent = 0;
      if (currentBpm) $stability.textContent = "medição pausada";
    }, RESET_TIMEOUT_MS);

    render();
  }

  /* ---------- Reset ---------- */
  function reset() {
    taps = [];
    currentBpm = null;
    clearTimeout(idleTimer);
    $bpm.textContent = "--";
    $count.textContent = "0";
    $stability.textContent = "aguardando…";
    $feedback.textContent = "";
    $use.disabled = true;
  }

  /* ---------- Transferir BPM para o cadastro (Épico 4) ---------- */
  function useBpm() {
    if (!currentBpm) return;
    Store.setPendingBpm(currentBpm);

    // Se o formulário de cadastro já existir na página, preenche direto.
    const bpmField = document.getElementById("trackBpm");
    if (bpmField) {
      bpmField.value = currentBpm;
      bpmField.dispatchEvent(new Event("input", { bubbles: true }));
    }

    $feedback.textContent = `✓ ${currentBpm} BPM guardado para o cadastro`;
    App.toast(`${currentBpm} BPM enviado ao cadastro de faixa`);
    App.navigateTo("acervo");
  }

  /* ---------- Bind ---------- */
  // pointerdown dá resposta mais rápida que click no toque
  $pad.addEventListener("pointerdown", (e) => { e.preventDefault(); handleTap(); });
  // suporte a teclado (acessibilidade): Espaço/Enter
  $pad.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); handleTap(); }
  });
  $reset.addEventListener("click", reset);
  $use.addEventListener("click", useBpm);

  reset();
})();
