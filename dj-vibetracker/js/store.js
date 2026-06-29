/* ============================================================
   store.js — Camada de persistência (localStorage)
   Fonte única de verdade do estado do app.
   Schema: { tracks: [], setlists: [], reviews: [] }
   ============================================================ */

const Store = (() => {
  const KEY = "djvibetracker.v1";

  const EMPTY = { tracks: [], setlists: [], reviews: [], transitions: [], currentSetlist: [] };

  /** Lê o estado completo do localStorage (com fallback seguro). */
  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return structuredClone(EMPTY);
      const parsed = JSON.parse(raw);
      return { ...structuredClone(EMPTY), ...parsed };
    } catch (e) {
      console.warn("[Store] Falha ao ler estado, retornando vazio.", e);
      return structuredClone(EMPTY);
    }
  }

  /** Grava o estado completo no localStorage. */
  function write(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.error("[Store] Falha ao gravar estado.", e);
      return false;
    }
  }

  /** Gera um UUID (com fallback para navegadores sem crypto.randomUUID). */
  function uuid() {
    if (crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // ---- Acessores por coleção ----
  function getTracks()      { return read().tracks; }
  function getSetlists()    { return read().setlists; }
  function getReviews()     { return read().reviews; }
  function getTransitions() { return read().transitions; }

  // ---- Faixas / Acervo (Épico 4) ----
  function addTrack(data) {
    const state = read();
    const item = { id: uuid(), createdAt: Date.now(), status: "ouvir", ...data };
    state.tracks.unshift(item);
    write(state);
    return item;
  }
  function updateTrack(id, patch) {
    const state = read();
    const t = state.tracks.find((x) => x.id === id);
    if (!t) return null;
    Object.assign(t, patch);
    write(state);
    return t;
  }
  function removeTrack(id) {
    const state = read();
    state.tracks = state.tracks.filter((t) => t.id !== id);
    // remove referências órfãs no setlist atual
    state.currentSetlist = state.currentSetlist.filter((sid) => sid !== id);
    write(state);
  }
  function setTrackStatus(id, status) {
    return updateTrack(id, { status });
  }

  // ---- Setlist atual (Épico 5) ----
  // Armazena apenas os IDs das faixas, na ordem do set. As faixas em si
  // vivem em `tracks` (fonte única); o setlist as referencia.
  function getCurrentSetlist() { return read().currentSetlist; }

  function addToSetlist(trackId) {
    const state = read();
    if (!state.currentSetlist.includes(trackId)) {
      state.currentSetlist.push(trackId);
      write(state);
    }
    return state.currentSetlist;
  }
  function removeFromSetlist(trackId) {
    const state = read();
    state.currentSetlist = state.currentSetlist.filter((id) => id !== trackId);
    write(state);
    return state.currentSetlist;
  }
  function moveInSetlist(trackId, dir) {
    const state = read();
    const list = state.currentSetlist;
    const i = list.indexOf(trackId);
    if (i < 0) return list;
    const j = i + dir;
    if (j < 0 || j >= list.length) return list;
    [list[i], list[j]] = [list[j], list[i]];
    write(state);
    return list;
  }
  /** Reordena por uma nova lista completa de IDs (usado pelo drag-and-drop). */
  function setSetlistOrder(ids) {
    const state = read();
    state.currentSetlist = ids;
    write(state);
    return ids;
  }
  function clearSetlist() {
    const state = read();
    state.currentSetlist = [];
    write(state);
  }

  // ---- Diário de Bordo / Reviews (Épico 6) ----
  function addReview(data) {
    const state = read();
    const item = { id: uuid(), createdAt: Date.now(), ...data };
    state.reviews.unshift(item);
    write(state);
    return item;
  }
  function removeReview(id) {
    const state = read();
    state.reviews = state.reviews.filter((r) => r.id !== id);
    write(state);
  }

  // ---- Transições (Épico 3) ----
  function addTransition(recipe) {
    const state = read();
    const item = { id: uuid(), createdAt: Date.now(), ...recipe };
    state.transitions.unshift(item);
    write(state);
    return item;
  }
  function removeTransition(id) {
    const state = read();
    state.transitions = state.transitions.filter((t) => t.id !== id);
    write(state);
  }

  /* ---- Campo volátil: BPM pendente vindo do Tap Tempo ----
     Usado como "ponte" entre a Feature 1.1 e o formulário de
     cadastro de faixa (Épico 4). Fica em chave separada para não
     poluir o estado persistente principal. */
  const PENDING_BPM_KEY = "djvibetracker.pendingBpm";
  function setPendingBpm(bpm) {
    try { localStorage.setItem(PENDING_BPM_KEY, String(bpm)); } catch (_) {}
  }
  function consumePendingBpm() {
    try {
      const v = localStorage.getItem(PENDING_BPM_KEY);
      localStorage.removeItem(PENDING_BPM_KEY);
      return v ? Number(v) : null;
    } catch (_) { return null; }
  }

  return {
    read, write, uuid,
    getTracks, getSetlists, getReviews, getTransitions,
    addTrack, updateTrack, removeTrack, setTrackStatus,
    getCurrentSetlist, addToSetlist, removeFromSetlist, moveInSetlist, setSetlistOrder, clearSetlist,
    addReview, removeReview,
    addTransition, removeTransition,
    setPendingBpm, consumePendingBpm,
  };
})();

window.Store = Store;
