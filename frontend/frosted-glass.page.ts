import { addPage, AutoloadPage } from '@hydrooj/ui-default';

interface GlassConfig {
  enabled: boolean;
  opacity: number;
  blur: number;
}

function getDomainId(): string {
  const m = window.location.pathname.match(/\/d\/([^/]+)/);
  return m ? m[1] : '';
}

let pending = false;

async function applyFrostedGlass() {
  // Prevent concurrent calls from polling + observer
  if (pending) return;
  pending = true;

  try {
    const domainId = getDomainId();

    // Remove previous style
    const existing = document.getElementById('fg-s');
    if (existing) existing.remove();

    // No domain in URL → no effect
    if (!domainId) return;

    const res = await fetch(`/frosted-glass/config?domainId=${domainId}`, {
      credentials: 'same-origin',
    });
    const config: GlassConfig = await res.json();
    if (!config.enabled) return;

    const style = document.createElement('style');
    style.id = 'fg-s';
    style.textContent = `#panel{background:rgba(255,255,255,${config.opacity})!important;backdrop-filter:blur(${config.blur}px) saturate(180%)!important;-webkit-backdrop-filter:blur(${config.blur}px) saturate(180%)!important}.section{border:1px solid rgba(0,0,0,.12)!important}`;
    document.head.appendChild(style);
  } catch {
    // Silently fail
  } finally {
    pending = false;
  }
}

// Initial application on first page load
addPage(new AutoloadPage('frosted_glass', applyFrostedGlass));

// PJAX may replace <head> at any time — poll for missing style and re-apply.
// getElementById is cheap; fetch only fires when the style is actually gone.
setInterval(() => {
  if (getDomainId() && !document.getElementById('fg-s')) {
    applyFrostedGlass();
  }
}, 500);
