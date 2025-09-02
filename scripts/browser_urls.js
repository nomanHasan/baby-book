(() => {
  // Collect likely Storybook page images
  const selectors = [
    'img[alt="Storybook page image"]',
    'storybook-image-page-content img',
    '.storybook-image img'
  ];
  const nodes = Array.from(document.querySelectorAll(selectors.join(',')));

  const seen = new Set();
  const urls = [];

  // Prefer <img> sources (handles srcset via currentSrc)
  for (const img of nodes) {
    const u = img.currentSrc || img.src;
    if (u && !seen.has(u)) {
      seen.add(u);
      urls.push(u);
      if (urls.length === 10) break;
    }
  }

  // Fallback: also look for background-image URLs if needed
  if (urls.length < 10) {
    const bgEls = Array.from(document.querySelectorAll('.storybook-image,[style*="background-image"]'));
    for (const el of bgEls) {
      const m = (getComputedStyle(el).backgroundImage || '').match(/url\(["']?(.*?)["']?\)/);
      if (m && m[1] && !seen.has(m[1])) {
        seen.add(m[1]);
        urls.push(m[1]);
        if (urls.length === 10) break;
      }
    }
  }

  console.log('Storybook image URLs:', urls);
  // Optional: copy to clipboard -> uncomment the next line
  // copy(urls.join('\n'));

  // Helper to open all URLs; should be called in a user-initiated event to avoid popup blocking
  const openAll = () => {
    for (const u of urls) {
      try {
        window.open(u, '_blank', 'noopener,noreferrer');
      } catch (err) {
        console.warn('Failed to open URL:', u, err);
      }
    }
  };

  // Always inject a one-click button so the user can trigger the openings in a gesture
  const existing = document.getElementById('bb-open-tabs-btn');
  if (existing) existing.remove();

  const btn = document.createElement('button');
  btn.id = 'bb-open-tabs-btn';
  btn.type = 'button';
  btn.textContent = `Open ${urls.length} image tab${urls.length === 1 ? '' : 's'}`;
  btn.setAttribute('aria-label', `Open ${urls.length} image ${urls.length === 1 ? 'tab' : 'tabs'}`);
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    zIndex: 999999,
    padding: '10px 14px',
    background: '#111',
    color: '#fff',
    border: '1px solid #555',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
  });
  btn.addEventListener('click', () => {
    for (const u of urls) {
      try {
        const w = window.open(u, '_blank');
        if (w) w.opener = null; // ensure no reference to the opener for security
      } catch (err) {
        console.warn('Failed to open URL:', u, err);
      }
    }
    btn.remove();
  });
  document.body.appendChild(btn);

  return urls;
})();
