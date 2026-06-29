/* ============================================================
   review.js — Épico 6: Gravação & Autoavaliação
   6.1 Set Review Journal (diário de bordo / post-mortem)
   ============================================================ */

(() => {
  const $date     = document.getElementById("reviewDate");
  const $duration = document.getElementById("reviewDuration");
  const $good     = document.getElementById("reviewGood");
  const $bad      = document.getElementById("reviewBad");
  const $save     = document.getElementById("reviewSave");
  const $list     = document.getElementById("reviewsList");

  if (!$list) return; // seção não presente

  // ---- Helpers ----
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  /** Converte texto multilinha em HTML escapado com <br>. */
  function multiline(s) {
    return escapeHtml(s).replace(/\n/g, "<br>");
  }
  /** "2026-06-29" -> "29/06/2026" (sem fuso: parse manual). */
  function formatDate(iso) {
    const m = String(iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return "Data não informada";
    return `${m[3]}/${m[2]}/${m[1]}`;
  }
  /** Hoje em formato yyyy-mm-dd (horário local). */
  function todayISO() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  /* ---------- Cadastro ---------- */
  function saveReview() {
    const good = $good.value.trim();
    const bad  = $bad.value.trim();
    if (!good && !bad) {
      App.toast("Anote ao menos um acerto ou ponto a melhorar");
      $good.focus();
      return;
    }

    const dur = $duration.value ? Number($duration.value) : null;

    Store.addReview({
      date: $date.value || todayISO(),
      duration: dur && dur > 0 && dur <= 600 ? dur : null,
      good,
      bad,
    });

    App.toast("Avaliação salva 📝");
    clearForm();
    render();
  }

  function clearForm() {
    $duration.value = "";
    $good.value = "";
    $bad.value = "";
    $date.value = todayISO();
  }

  /* ---------- Render do histórico ---------- */
  function reviewCard(r) {
    const dur = r.duration ? ` · ${r.duration} min` : "";
    const good = r.good
      ? `<div class="review__block review__block--good">
           <span class="review__label">✅ O que ficou bom</span>
           <p class="review__text">${multiline(r.good)}</p>
         </div>`
      : "";
    const bad = r.bad
      ? `<div class="review__block review__block--bad">
           <span class="review__label">⚠️ O que precisa melhorar</span>
           <p class="review__text">${multiline(r.bad)}</p>
         </div>`
      : "";

    return `
      <details class="review">
        <summary class="review__summary">
          <span class="review__date">🗓️ ${formatDate(r.date)}${dur}</span>
          <button class="review__del" data-del="${r.id}" title="Excluir" aria-label="Excluir avaliação">✕</button>
        </summary>
        <div class="review__body">
          ${good}
          ${bad}
        </div>
      </details>`;
  }

  function render() {
    const reviews = Store.getReviews();
    if (!reviews.length) {
      $list.innerHTML = `<p class="empty">Nenhum treino registrado ainda. Após mixar, registre seu post-mortem acima.</p>`;
      return;
    }
    $list.innerHTML = reviews.map(reviewCard).join("");
  }

  /* ---------- Eventos ---------- */
  $save.addEventListener("click", saveReview);

  $list.addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]");
    if (del) {
      // o botão fica dentro do <summary>: evita abrir/fechar o details ao excluir
      e.preventDefault();
      Store.removeReview(del.dataset.del);
      render();
      App.toast("Avaliação removida");
    }
  });

  // init
  $date.value = todayISO();
  render();

  window.Review = { refresh: render };
})();
