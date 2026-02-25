/* ===== Mistie's Celebration — Admin Dashboard ===== */
(function () {
  function refresh() {
    renderStats();
    renderTable();
  }

  // ── Stats ──
  function renderStats() {
    const s = AppData.getStats();
    document.getElementById('stat-total').textContent = s.total;
    document.getElementById('stat-fragrance').textContent = s.fragrance;
    document.getElementById('stat-karaoke').textContent = s.karaoke;
    document.getElementById('stat-lounge').textContent = s.lounge;
  }

  // ── Table ──
  function renderTable() {
    const list = AppData.getRSVPs();
    const tbody = document.getElementById('table-body');
    document.getElementById('table-count').textContent = list.length + ' response' + (list.length !== 1 ? 's' : '');

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-row">No RSVPs yet.</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(r => {
      const badge = (v) => v
        ? '<span class="badge badge-yes">Yes</span>'
        : '<span class="badge badge-no">—</span>';
      const time = r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '—';

      return `<tr>
        <td class="td-name">${esc(r.name)}</td>
        <td>${esc(r.phone || '—')}</td>
        <td class="td-center">${badge(r.fragrance)}</td>
        <td class="td-center">${badge(r.karaoke)}</td>
        <td class="td-center">${badge(r.lounge)}</td>
        <td class="td-message">${esc(r.message || '—')}</td>
        <td class="td-date">${time}</td>
        <td><button class="btn btn-outline btn-sm btn-delete" data-id="${r.id}">Delete</button></td>
      </tr>`;
    }).join('');

    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', e => {
        if (confirm('Delete this RSVP?')) {
          AppData.deleteRSVP(e.target.dataset.id);
          refresh();
        }
      });
    });
  }

  function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ── Buttons ──
  document.getElementById('btn-export').addEventListener('click', () => AppData.downloadCSV());
  document.getElementById('btn-refresh').addEventListener('click', refresh);

  // ── Real-time sync ──
  AppData.onSync(refresh);

  refresh();
})();
