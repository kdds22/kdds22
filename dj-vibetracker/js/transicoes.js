/* ============================================================
   transicoes.js — Épico 3: Planejamento de Transições
   3.1 Transition Planner · 3.2 Randomizer Challenge
   ============================================================ */

(() => {
  // ---- Elementos ----
  const $a       = document.getElementById("trackA");
  const $b       = document.getElementById("trackB");
  const $note    = document.getElementById("planNote");
  const $save    = document.getElementById("planSave");
  const $list    = document.getElementById("recipesList");
  const $gen     = document.getElementById("challengeGen");
  const $chOut   = document.getElementById("challengeOut");

  if (!$a) return; // seção não presente

  const POINTS = ["Intro", "Break", "Drop", "Outro"];

  // ---- Helpers ----
  function trackLabel(t) {
    const artist = t.artist ? `${t.artist} — ` : "";
    return `${artist}${t.title || "(sem título)"}`;
  }
  function metaLine(t) {
    const bpm = t.bpm ? App.blurable(`${t.bpm} BPM`, "BPM") : "";
    const key = t.key ? App.blurable(escapeHtml(t.key), "Tom") : "";
    const sep = bpm && key ? " · " : "";
    return bpm || key ? `<span class="recipe__meta">${bpm}${sep}${key}</span>` : "";
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function findTrack(id) {
    return Store.getTracks().find((t) => t.id === id) || null;
  }

  /* ========== Popular dropdowns a partir do acervo ========== */
  function populateDecks() {
    const tracks = Store.getTracks();
    const prevA = $a.value, prevB = $b.value;

    if (!tracks.length) {
      const opt = `<option value="" disabled selected>Nenhuma faixa no acervo ainda</option>`;
      $a.innerHTML = opt;
      $b.innerHTML = opt;
      $a.disabled = $b.disabled = true;
      $save.disabled = true;
      return;
    }

    $a.disabled = $b.disabled = $save.disabled = false;
    const opts = tracks
      .map((t) => `<option value="${t.id}">${escapeHtml(trackLabel(t))}</option>`)
      .join("");
    $a.innerHTML = opts;
    $b.innerHTML = opts;

    // mantém seleção anterior se ainda existir; senão A=0, B=1 (se houver)
    $a.value = tracks.some((t) => t.id === prevA) ? prevA : tracks[0].id;
    $b.value = tracks.some((t) => t.id === prevB) ? prevB
             : (tracks[1] ? tracks[1].id : tracks[0].id);
  }

  /* ========== 3.1 Salvar receita ========== */
  function collectChecks(deck) {
    return [...document.querySelectorAll(`.checks input[data-deck="${deck}"]:checked`)]
      .map((c) => c.value);
  }

  function saveRecipe() {
    const tA = findTrack($a.value);
    const tB = findTrack($b.value);
    if (!tA || !tB) { App.toast("Selecione as duas faixas"); return; }

    const recipe = {
      aId: tA.id, aLabel: trackLabel(tA),
      bId: tB.id, bLabel: trackLabel(tB),
      aActions: collectChecks("a"),
      bActions: collectChecks("b"),
      note: $note.value.trim(),
    };
    Store.addTransition(recipe);
    App.toast("Receita salva 💾");

    // limpa checkboxes e observação
    document.querySelectorAll(".checks input:checked").forEach((c) => (c.checked = false));
    $note.value = "";
    renderRecipes();
  }

  /* ========== Render das receitas salvas ========== */
  function actionList(actions, fallback) {
    if (!actions.length) return `<li class="recipe__none">${fallback}</li>`;
    return actions.map((a) => `<li>✓ ${escapeHtml(a)}</li>`).join("");
  }

  function renderRecipes() {
    const recipes = Store.getTransitions();
    if (!recipes.length) {
      $list.innerHTML = `<p class="empty">Nenhuma receita salva ainda.</p>`;
      return;
    }
    $list.innerHTML = recipes.map((r) => `
      <article class="recipe" data-id="${r.id}">
        <header class="recipe__head">
          <span class="recipe__route">${escapeHtml(r.aLabel)} <b>→</b> ${escapeHtml(r.bLabel)}</span>
          <button class="recipe__del" data-del="${r.id}" title="Excluir" aria-label="Excluir receita">✕</button>
        </header>
        <div class="recipe__cols">
          <div>
            <span class="recipe__deck">Música A</span>
            <ul>${actionList(r.aActions, "sem ações")}</ul>
          </div>
          <div>
            <span class="recipe__deck">Música B</span>
            <ul>${actionList(r.bActions, "sem ações")}</ul>
          </div>
        </div>
        ${r.note ? `<p class="recipe__note">📝 ${escapeHtml(r.note)}</p>` : ""}
      </article>
    `).join("");
  }

  /* ========== 3.2 Randomizer Challenge ========== */
  function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function generateChallenge() {
    const tracks = Store.getTracks();
    if (tracks.length < 2) {
      $chOut.innerHTML = `<p class="empty">Cadastre ao menos 2 faixas no Acervo para gerar desafios.</p>`;
      return;
    }
    // sorteia 2 IDs distintos
    const i1 = Math.floor(Math.random() * tracks.length);
    let i2 = Math.floor(Math.random() * tracks.length);
    while (i2 === i1) i2 = Math.floor(Math.random() * tracks.length);

    const t1 = tracks[i1], t2 = tracks[i2];
    const p1 = randomItem(POINTS);
    const p2 = randomItem(POINTS);

    $chOut.innerHTML = `
      <div class="challenge__card">
        <p class="challenge__lead">Desafio:</p>
        <p class="challenge__text">
          Mixar <strong>${escapeHtml(trackLabel(t1))}</strong> no <em>${p1}</em>
          para <strong>${escapeHtml(trackLabel(t2))}</strong> no <em>${p2}</em>.
        </p>
        <div class="challenge__meta">${metaLine(t1)} ${metaLine(t2)}</div>
      </div>`;
  }

  /* ========== Bind ========== */
  $save.addEventListener("click", saveRecipe);
  $gen.addEventListener("click", generateChallenge);
  $list.addEventListener("click", (e) => {
    const del = e.target.closest("[data-del]");
    if (del) {
      Store.removeTransition(del.dataset.del);
      renderRecipes();
    }
  });

  // Repopula os dropdowns sempre que a aba Transições é aberta
  // (cobre faixas cadastradas no Acervo durante a sessão — Épico 4).
  document.getElementById("bottomNav")?.addEventListener("click", (e) => {
    if (e.target.closest('[data-target="transicoes"]')) populateDecks();
  });

  // init
  populateDecks();
  renderRecipes();

  // exposto para outros módulos atualizarem os decks ao mudar o acervo
  window.Transicoes = { refresh: populateDecks };
})();
