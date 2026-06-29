/* ============================================================
   setlist.js — Épico 5: Setlist Flow
   5.1 Construtor de Set (biblioteca + set com Drag and Drop)
   ============================================================ */

(() => {
  const $list    = document.getElementById("setlistList");
  const $library = document.getElementById("library");
  const $count   = document.getElementById("setCount");
  const $clear   = document.getElementById("setClear");

  if (!$list) return; // seção não presente

  // ---- Helpers ----
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function trackLabel(t) {
    const artist = t.artist ? `${t.artist} — ` : "";
    return `${artist}${t.title || "(sem título)"}`;
  }
  function metaLine(t) {
    const parts = [];
    if (t.bpm) parts.push(App.blurable(`${t.bpm} BPM`, "BPM"));
    if (t.key) parts.push(App.blurable(escapeHtml(t.key), "Tom"));
    if (t.energy) parts.push(`<span class="track__energy">${"●".repeat(t.energy)}${"○".repeat(5 - t.energy)}</span>`);
    return parts.length ? `<span class="setlist__meta">${parts.join(" · ")}</span>` : "";
  }
  /* ---------- 5.2 Validador Harmônico (Roda Camelot) ---------- */
  /** "8A" -> { n: 8, l: "A" }; null se formato inválido. */
  function parseCamelot(key) {
    const m = String(key || "").trim().toUpperCase().match(/^(\d{1,2})([AB])$/);
    if (!m) return null;
    const n = Number(m[1]);
    if (n < 1 || n > 12) return null;
    return { n, l: m[2] };
  }

  /**
   * Compatibilidade harmônica entre dois tons Camelot.
   * Compatível quando: mesmo tom; mesmo número e letras diferentes (8A↔8B);
   * ou mesma letra com ±1 no número (com wraparound 12↔1).
   * @returns {boolean|null} true/false, ou null se algum tom for inválido/ausente.
   */
  function checkHarmonicCompatibility(key1, key2) {
    const a = parseCamelot(key1);
    const b = parseCamelot(key2);
    if (!a || !b) return null; // tom desconhecido — sem julgamento
    if (a.n === b.n && a.l === b.l) return true;          // mesmo tom
    if (a.n === b.n && a.l !== b.l) return true;          // mesma posição, letra diferente
    if (a.l === b.l) {                                    // mesma letra, ±1 número
      const diff = Math.abs(a.n - b.n);
      return diff === 1 || diff === 11;                  // 11 cobre o wraparound 12↔1
    }
    return false;
  }

  /** HTML do conector de compatibilidade entre a faixa anterior e a atual. */
  function harmonicConnector(prev, cur) {
    const r = checkHarmonicCompatibility(prev.key, cur.key);
    let cls, icon, text;
    if (r === true)       { cls = "ok";      icon = "✅"; text = "Compatível"; }
    else if (r === false) { cls = "warn";    icon = "⚠️"; text = "Tom incompatível"; }
    else                  { cls = "unknown"; icon = "❔"; text = "Tom não informado"; }
    return `<div class="setlist__harm setlist__harm--${cls}" title="${text}">
      <span class="setlist__harm-icon" aria-hidden="true">${icon}</span>
      <span class="setlist__harm-text">${text}</span>
    </div>`;
  }

  function trackMap() {
    const m = new Map();
    Store.getTracks().forEach((t) => m.set(t.id, t));
    return m;
  }

  /* ---------- Render do setlist ---------- */
  function renderSetlist() {
    const ids = Store.getCurrentSetlist();
    const map = trackMap();
    // resolve faixas existentes na ordem; ignora órfãs eventuais
    const items = ids.map((id) => map.get(id)).filter(Boolean);

    $count.textContent = `${items.length} faixa${items.length === 1 ? "" : "s"}`;

    if (!items.length) {
      $list.innerHTML = `<li class="empty setlist__empty">Set vazio — adicione faixas da biblioteca abaixo.</li>`;
      return;
    }

    $list.innerHTML = items.map((t, i) => `
      <li class="setlist__item" draggable="true" data-id="${t.id}">
        ${i > 0 ? harmonicConnector(items[i - 1], t) : ""}
        <div class="setlist__row">
          <span class="setlist__pos">${i + 1}</span>
          <span class="setlist__grip" aria-hidden="true">⠿</span>
          <span class="setlist__info">
            <span class="setlist__title">${escapeHtml(trackLabel(t))}</span>
            ${metaLine(t)}
          </span>
          <span class="setlist__btns">
            <button class="setlist__mv" data-mv="-1" data-id="${t.id}" title="Subir" aria-label="Subir"${i === 0 ? " disabled" : ""}>▲</button>
            <button class="setlist__mv" data-mv="1" data-id="${t.id}" title="Descer" aria-label="Descer"${i === items.length - 1 ? " disabled" : ""}>▼</button>
            <button class="setlist__rm" data-rm="${t.id}" title="Remover do set" aria-label="Remover">✕</button>
          </span>
        </div>
      </li>`).join("");
  }

  /* ---------- Render da biblioteca ---------- */
  function renderLibrary() {
    const tracks = Store.getTracks();
    const inSet = new Set(Store.getCurrentSetlist());

    if (!tracks.length) {
      $library.innerHTML = `<p class="empty">Nenhuma faixa no acervo. Cadastre faixas na aba Acervo.</p>`;
      return;
    }

    $library.innerHTML = tracks.map((t) => {
      const added = inSet.has(t.id);
      return `
        <article class="library__item">
          <span class="library__info">
            <span class="library__title">${escapeHtml(trackLabel(t))}</span>
            ${metaLine(t)}
          </span>
          <button class="library__add" data-add="${t.id}" ${added ? "disabled" : ""}>
            ${added ? "✓ no set" : "+ Adicionar"}
          </button>
        </article>`;
    }).join("");
  }

  function renderAll() { renderSetlist(); renderLibrary(); }

  /* ---------- Drag and Drop (API nativa HTML5) ---------- */
  function getDragAfter(y) {
    const els = [...$list.querySelectorAll(".setlist__item:not(.is-dragging)")];
    return els.reduce((closest, el) => {
      const box = el.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) return { offset, el };
      return closest;
    }, { offset: -Infinity, el: null }).el;
  }

  function persistOrderFromDom() {
    const ids = [...$list.querySelectorAll(".setlist__item")].map((li) => li.dataset.id);
    Store.setSetlistOrder(ids);
    renderSetlist(); // re-render para corrigir numeração e estado das setas
  }

  $list.addEventListener("dragstart", (e) => {
    const li = e.target.closest(".setlist__item");
    if (!li) return;
    li.classList.add("is-dragging");
    e.dataTransfer.effectAllowed = "move";
  });
  $list.addEventListener("dragend", (e) => {
    const li = e.target.closest(".setlist__item");
    if (li) li.classList.remove("is-dragging");
    persistOrderFromDom();
  });
  $list.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = $list.querySelector(".is-dragging");
    if (!dragging) return;
    const after = getDragAfter(e.clientY);
    if (after == null) $list.appendChild(dragging);
    else $list.insertBefore(dragging, after);
  });

  /* ---------- Cliques (delegação) ---------- */
  $list.addEventListener("click", (e) => {
    const mv = e.target.closest("[data-mv]");
    if (mv) { Store.moveInSetlist(mv.dataset.id, Number(mv.dataset.mv)); renderSetlist(); renderLibrary(); return; }
    const rm = e.target.closest("[data-rm]");
    if (rm) { Store.removeFromSetlist(rm.dataset.rm); renderAll(); }
  });

  $library.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) { Store.addToSetlist(add.dataset.add); renderAll(); App.toast("Faixa adicionada ao set ➕"); }
  });

  $clear.addEventListener("click", () => {
    if (!Store.getCurrentSetlist().length) return;
    Store.clearSetlist();
    renderAll();
    App.toast("Set limpo");
  });

  // Re-render ao abrir a aba (faixas podem ter mudado no Acervo)
  document.getElementById("bottomNav")?.addEventListener("click", (e) => {
    if (e.target.closest('[data-target="setlist"]')) renderAll();
  });

  // init
  renderAll();

  window.Setlist = { refresh: renderAll, checkHarmonicCompatibility };
})();
