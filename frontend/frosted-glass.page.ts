// Frosted glass CSS is now rendered server-side via templates/layout/basic.html.
// The handler/after hook in index.ts injects config into UiContext,
// and the template outputs the <style> tag directly in the HTML.
// This survives PJAX because the style is part of the static page chrome,
// not dynamically injected JavaScript.
