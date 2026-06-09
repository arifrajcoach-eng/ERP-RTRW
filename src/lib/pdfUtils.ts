export const sanitizeCSS = (css: string) => {
  if (!css) return '';
  // More robust replacement for oklch and oklab.
  // Matching any balanced parentheses content after the function name to be safe.
  return css
    .replace(/oklch\([^)]+(\/[^)]+)?\)/gi, '#475569')
    .replace(/oklab\([^)]+(\/[^)]+)?\)/gi, '#475569');
};

export const applyColorSanitization = (clonedDoc: Document) => {
  // 1. Sanitize all style tags
  const styleTags = clonedDoc.getElementsByTagName('style');
  for (let i = 0; i < styleTags.length; i++) {
    try {
      if (styleTags[i].innerHTML) {
        styleTags[i].innerHTML = sanitizeCSS(styleTags[i].innerHTML);
      }
      if (styleTags[i].textContent) {
        styleTags[i].textContent = sanitizeCSS(styleTags[i].textContent);
      }
    } catch (e) {
      console.warn('Failed to sanitize style tag:', e);
    }
  }

  // 2. Sanitize inline styles on all elements
  const allElements = clonedDoc.querySelectorAll('*');
  allElements.forEach((el) => {
    const styleAttr = el.getAttribute('style');
    if (styleAttr && (styleAttr.includes('oklch') || styleAttr.includes('oklab'))) {
      el.setAttribute('style', sanitizeCSS(styleAttr));
    }
  });
};
