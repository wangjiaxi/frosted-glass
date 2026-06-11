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

  // Remove previous style so it can be re-created with fresh config
  const existing = document.getElementById('fg-s');
  if (existing) existing.remove();

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

// Apply on every page load (including PJAX navigations)
addPage(new AutoloadPage('frosted_glass', applyFrostedGlass));

// Also re-apply on every Hydrooj page initialization event for PJAX resilience
$(document).on('vjPageFullyInitialized', applyFrostedGlass);
