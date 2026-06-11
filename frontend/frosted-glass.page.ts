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

  // Remove previous style
  const existing = document.getElementById('fg-s');
  if (existing) existing.remove();

  // No domain in URL → no effect
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

// Initial application on first page load
addPage(new AutoloadPage('frosted_glass', applyFrostedGlass));

// PJAX replaces the entire <head> element, so a MutationObserver on
// document.head would die with the old node. Instead, we watch the
// <html> element for <head> removal, then re-apply after the new
// <head> has been inserted.
new MutationObserver((mutations) => {
  for (const m of mutations) {
    for (const node of m.removedNodes) {
      if (node instanceof HTMLElement && node.tagName === 'HEAD') {
        // <head> was replaced — wait for new head to settle, then re-apply
        setTimeout(() => {
          if (!document.getElementById('fg-s')) {
            applyFrostedGlass();
          }
        }, 0);
        return;
      }
    }
  }
}).observe(document.documentElement, { childList: true });
