/* ===== Mistie's Celebration — Invite Page ===== */
(function () {
  // ── Countdown ──
  const TARGET = new Date('2026-03-07T15:30:00');

  function updateCountdown() {
    const now = new Date();
    const diff = TARGET - now;

    if (diff <= 0) {
      document.getElementById('cd-days').textContent = '00';
      document.getElementById('cd-hours').textContent = '00';
      document.getElementById('cd-mins').textContent = '00';
      document.getElementById('cd-secs').textContent = '00';
      document.getElementById('cd-message').textContent = "The celebration is happening now! \uD83C\uDF89";
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    const pad = n => String(n).padStart(2, '0');
    document.getElementById('cd-days').textContent = pad(d);
    document.getElementById('cd-hours').textContent = pad(h);
    document.getElementById('cd-mins').textContent = pad(m);
    document.getElementById('cd-secs').textContent = pad(s);

    // Flash seconds
    const secEl = document.getElementById('cd-secs');
    secEl.classList.add('flash');
    setTimeout(() => secEl.classList.remove('flash'), 500);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ── RSVP Form ──
  const form = document.getElementById('rsvp-form');
  const successEl = document.getElementById('rsvp-success');
  const errorEl = document.getElementById('form-error');
  const sendingEl = document.getElementById('form-sending');
  let editingId = null;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';

    const name = document.getElementById('rsvp-name').value.trim();
    if (!name) {
      showError('Please enter your name.');
      document.getElementById('rsvp-name').classList.add('invalid');
      return;
    }
    document.getElementById('rsvp-name').classList.remove('invalid');

    // Check duplicate
    if (!editingId) {
      const existing = AppData.findByName(name);
      if (existing) {
        showError('That name is already registered. Scroll down to edit, or use a different name.');
        return;
      }
    }

    const rsvp = {
      id: editingId || undefined,
      name,
      phone: document.getElementById('rsvp-phone').value.trim(),
      fragrance: document.getElementById('rsvp-fragrance').checked,
      karaoke: document.getElementById('rsvp-karaoke').checked,
      lounge: document.getElementById('rsvp-lounge').checked,
      message: document.getElementById('rsvp-message').value.trim(),
      submittedAt: new Date().toISOString(),
    };

    sendingEl.style.display = 'inline';
    // Small delay for UX feel
    setTimeout(() => {
      AppData.saveRSVP(rsvp);
      sendingEl.style.display = 'none';
      form.style.display = 'none';
      successEl.style.display = 'block';

      const activities = [rsvp.fragrance && 'Fragrance', rsvp.karaoke && 'Karaoke', rsvp.lounge && 'Lounge'].filter(Boolean);
      document.getElementById('success-text').textContent = activities.length > 0
        ? `Thanks, ${name}! You're signed up for: ${activities.join(', ')}.`
        : `Thanks, ${name}! Your RSVP has been recorded.`;

      // Show fragrance reminder if they checked it
      document.getElementById('fragrance-reminder').style.display = rsvp.fragrance ? 'block' : 'none';
      editingId = null;
    }, 400);
  });

  // ── Edit RSVP ──
  document.getElementById('btn-edit-rsvp').addEventListener('click', () => {
    successEl.style.display = 'none';
    form.style.display = 'flex';
  });

  // ── Clear invalid on input ──
  document.querySelectorAll('.rsvp-form input, .rsvp-form select, .rsvp-form textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('invalid'));
  });

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = 'block';
    setTimeout(() => { errorEl.style.display = 'none'; }, 5000);
  }
})();
