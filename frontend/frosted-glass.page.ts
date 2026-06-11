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

async function applyFrostedGlass() {
  const domainId = getDomainId();
  if (!domainId) return;

  try {
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
    // Silently fail if config unavailable
  }
}

addPage(new AutoloadPage('frosted_glass', applyFrostedGlass));
