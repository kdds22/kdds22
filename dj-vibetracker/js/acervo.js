/* ============================================================
   acervo.js — Épico 4: Curadoria & Acervo
   4.1 Inbox de Garimpo (Scraping Board)
   Cadastro de faixas + quadro Kanban por status de curadoria.
   ============================================================ */

(() => {
  // ---- Elementos do formulário ----
  const $title  = document.getElementById("trackTitle");
  const $artist = document.getElementById("trackArtist");
  const $bpm    = document.getElementById("trackBpm");
  const $key    = document.getElementById("trackKey");
  const $energy = document.getElementById("trackEnergy");
  const $status = document.getElementById("trackStatus");
  const $url    = document.getElementById("trackUrl");
  const $save   = document.getElementById("trackSave");
  const $board  = document.getElementById("board");

  if (!$board) return; // seção não presente

  // Status na ordem do fluxo de garimpo.
  const STATUSES = [
    { key: "ouvir",   num: "1", label: "Para Ouvir",        emoji: "👂" },
    { key: "aprovar", num: "2", label: "Aprovar / Comprar", emoji: "💳" },
    { key: "baixada", num: "3", label: "Baixada / Rekordbox", emoji: "✅" },
  ];

  // ---- Helpers ----
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function trackLabel(t) {
    const artist = t.artist ? `${t.artist} — ` : "";
    return `${artist}${t.title || "(sem título)"}`;
  }
  function energyDots(n) {
    const e = Math.max(0, Math.min(5, Number(n) || 0));
    return "●".repeat(e) + "○".repeat(5 - e);
  }

  /* ---------- Cadastro ---------- */
  function saveTrack() {
    const title = $title.value.trim();
    if (!title) { App.toast("Informe ao menos o título"); $title.focus(); return; }

    const bpm = $bpm.value ? Number($bpm.value) : null;
    const energy = $energy.value ? Number($energy.value) : null;

    Store.addTrack({
      title,
      artist: $artist.value.trim(),
      bpm: bpm && bpm >= 40 && bpm <= 300 ? bpm : null,
      key: $key.value.trim(),
      energy: energy && energy >= 1 && energy <= 5 ? energy : null,
      url: $url.value.trim(),
      status: $status.value,
    });

    App.toast("Faixa adicionada 💿");
    clearForm();
    render();
    window.Transicoes?.refresh(); // mantém os decks do Épico 3 em dia
  }

  function clearForm() {
    [$title, $artist, $bpm, $key, $energy, $url].forEach((el) => (el.value = ""));
    $status.value = "ouvir";
  }

  /* ---------- Render do quadro ---------- */
  function moveButtons(track) {
    // botões de 1 clique para os demais status
    return STATUSES
      .filter((s) => s.key !== track.status)
      .map((s) => `<button class="track__move" data-move="${s.key}" data-id="${track.id}"
                    title="Mover para ${s.label}">${s.emoji} ${s.num}</button>`)
      .join("");
  }

  function trackCard(t) {
    const meta = [];
    if (t.bpm)    meta.push(App.blurable(`${t.bpm} BPM`, "BPM"));
    if (t.key)    meta.push(App.blurable(escapeHtml(t.key), "Tom"));
    if (t.energy) meta.push(`<span class="track__energy" title="Energia">${energyDots(t.energy)}</span>`);
    const metaLine = meta.length ? `<div class="track__meta">${meta.join(" · ")}</div>` : "";

    const link = t.url
      ? `<a class="track__link" href="${escapeHtml(t.url)}" target="_blank" rel="noopener noreferrer">🔗 Referência</a>`
      : "";

    return `
      <article class="track" data-id="${t.id}">
        <div class="track__main">
          <p class="track__title">${escapeHtml(trackLabel(t))}</p>
          ${metaLine}
          ${link}
        </div>
        <div class="track__actions">
          <div class="track__moves">${moveButtons(t)}</div>
          <button class="track__del" data-del="${t.id}" title="Excluir" aria-label="Excluir faixa">✕</button>
        </div>
      </article>`;
  }

  function render() {
    const tracks = Store.getTracks();

    $board.innerHTML = STATUSES.map((s) => {
      const items = tracks.filter((t) => (t.status || "ouvir") === s.key);
      const cards = items.length
        ? items.map(trackCard).join("")
        : `<p class="empty">Vazio</p>`;
      return `
        <section class="board__col" data-status="${s.key}">
          <header class="board__head">
            <span class="board__title">${s.emoji} ${s.label}</span>
            <span class="board__count">${items.length}</span>
          </header>
          <div class="board__cards">${cards}</div>
        </section>`;
    }).join("");
  }

  /* ---------- Eventos do quadro (delegação) ---------- */
  $board.addEventListener("click", (e) => {
    const mv = e.target.closest("[data-move]");
    if (mv) {
      Store.setTrackStatus(mv.dataset.id, mv.dataset.move);
      render();
      window.Transicoes?.refresh();
      return;
    }
    const del = e.target.closest("[data-del]");
    if (del) {
      Store.removeTrack(del.dataset.del);
      render();
      window.Transicoes?.refresh();
    }
  });

  /* ---------- Ponte com o Tap Tempo (Épico 1.1) ---------- */
  function consumePending() {
    const pending = Store.consumePendingBpm();
    if (pending) {
      $bpm.value = pending;
      $title.focus();
    }
  }

  /* ---------- Bind ---------- */
  $save.addEventListener("click", saveTrack);

  // Ao abrir a aba Acervo, consome um BPM eventualmente enviado pelo Tap Tempo.
  document.getElementById("bottomNav")?.addEventListener("click", (e) => {
    if (e.target.closest('[data-target="acervo"]')) consumePending();
  });

  // init
  consumePending();
  render();

  window.Acervo = { refresh: render };
})();
