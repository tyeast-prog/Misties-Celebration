/* ===== Mistie's Celebration — Data Layer ===== */

const AppData = (() => {
  const KEYS = { rsvps: 'celebration_rsvps' };

  // --- localStorage helpers ---
  function read(key) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; }
    catch { return null; }
  }
  function write(key, v) { localStorage.setItem(key, JSON.stringify(v)); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }

  // --- Firestore ---
  let db = null;
  const syncCallbacks = [];

  function initFirestore() {
    if (typeof firebase === 'undefined' || typeof FIREBASE_CONFIG === 'undefined') return;
    if (!FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey.startsWith('YOUR_')) return;
    try {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.firestore();
      db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
      setupListeners();
    } catch (e) {
      console.warn('Firebase init failed:', e.message);
    }
  }

  function setupListeners() {
    if (!db) return;
    db.collection('rsvps').onSnapshot(snap => {
      const list = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      write(KEYS.rsvps, list);
      syncCallbacks.forEach(cb => cb());
    });
  }

  function onSync(cb) { syncCallbacks.push(cb); }

  // --- RSVP CRUD ---
  function getRSVPs() { return read(KEYS.rsvps) || []; }

  function saveRSVP(rsvp) {
    const list = getRSVPs();
    if (!rsvp.id) rsvp.id = uid();
    const idx = list.findIndex(r => r.id === rsvp.id);
    if (idx >= 0) list[idx] = rsvp; else list.push(rsvp);
    write(KEYS.rsvps, list);
    if (db) {
      const { id, ...data } = rsvp;
      db.collection('rsvps').doc(id).set(data).catch(e => console.warn('Firestore save error:', e.message));
    }
    syncCallbacks.forEach(cb => cb());
    return rsvp;
  }

  function findByName(name) {
    return getRSVPs().find(r => r.name.toLowerCase().trim() === name.toLowerCase().trim()) || null;
  }

  function deleteRSVP(id) {
    const list = getRSVPs().filter(r => r.id !== id);
    write(KEYS.rsvps, list);
    if (db) db.collection('rsvps').doc(id).delete().catch(() => {});
    syncCallbacks.forEach(cb => cb());
  }

  // --- Stats ---
  function getStats() {
    const list = getRSVPs();
    return {
      total: list.length,
      fragrance: list.filter(r => r.fragrance).length,
      karaoke: list.filter(r => r.karaoke).length,
      lounge: list.filter(r => r.lounge).length,
    };
  }

  // --- CSV Export ---
  function downloadCSV() {
    const list = getRSVPs();
    const header = ['Name', 'Phone', 'Fragrance', 'Karaoke', 'Lounge', 'Message', 'Submitted'];
    const rows = list.map(r => [
      r.name, r.phone || '',
      r.fragrance ? 'Yes' : 'No', r.karaoke ? 'Yes' : 'No', r.lounge ? 'Yes' : 'No',
      r.message || '', r.submittedAt || '',
    ]);
    const esc = v => '"' + String(v).replace(/"/g, '""') + '"';
    const csv = [header.map(esc).join(','), ...rows.map(r => r.map(esc).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'celebration-rsvps.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  initFirestore();

  return {
    getRSVPs, saveRSVP, findByName, deleteRSVP,
    getStats, downloadCSV, onSync,
  };
})();
