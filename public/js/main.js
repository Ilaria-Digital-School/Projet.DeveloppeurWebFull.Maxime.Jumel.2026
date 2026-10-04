(function () {
  const form = document.getElementById('newsletter-form');
  const alertBox = document.getElementById('newsletter-alert');

  if (!form || !alertBox) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('newsletter-email').value.trim();
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;

    try {
      const res = await fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email })
      });

      const data = await res.json();
      const isSuccess = data.success;
      const bg = isSuccess ? '#d1e7dd' : '#f8d7da';
      const border = isSuccess ? '#a3cfbb' : '#f1aeb5';
      const color = isSuccess ? '#0a3622' : '#58151c';

      alertBox.innerHTML = `
        <div style="
          background:${bg};
          border:1px solid ${border};
          color:${color};
          padding:.75rem 1rem;
          border-radius:.375rem;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:.5rem;
          opacity:1;
          transition:opacity .3s ease;
        ">
          <span>${data.message}</span>
          <button onclick="this.closest('div').style.opacity=0;setTimeout(()=>this.closest('div').remove(),300)"
            style="background:none;border:none;cursor:pointer;font-size:1.1rem;line-height:1;padding:0;color:inherit;"
            aria-label="Fermer">&times;</button>
        </div>`;

      if (isSuccess) form.reset();

      // Auto-dismiss après 5s
      setTimeout(() => {
        const el = alertBox.querySelector('div');
        if (el) {
          el.style.opacity = '0';
          setTimeout(() => alertBox.innerHTML = '', 300);
        }
      }, 5000);

    } catch (err) {
      alertBox.innerHTML = `
        <div style="background:#f8d7da;border:1px solid #f1aeb5;color:#58151c;padding:.75rem 1rem;border-radius:.375rem;">
          Une erreur est survenue. Veuillez réessayer.
        </div>`;
    } finally {
      btn.disabled = false;
    }
  });
})();