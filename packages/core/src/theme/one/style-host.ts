type CssVarMap = Record<string, string>;

const ONE_THEME_STYLE_ATTR = 'data-one-theme-style';

export function serializeVarsToCssText(vars: CssVarMap): string {
  const lines = Object.entries(vars)
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
    .map(([name, value]) => `  ${name}: ${value};`);

  return `:root {\n${lines.join('\n')}\n}\n`;
}

export function ensureThemeStyleElement(id: string): HTMLStyleElement | null {
  if (typeof document === 'undefined') return null;

  const existing = document.getElementById(id);
  if (existing instanceof HTMLStyleElement) {
    return existing;
  }

  if (existing) {
    existing.remove();
  }

  const styleElement = document.createElement('style');
  styleElement.id = id;
  styleElement.type = 'text/css';
  styleElement.setAttribute(ONE_THEME_STYLE_ATTR, 'true');

  const head = document.head ?? document.getElementsByTagName('head')[0];
  if (!head) return null;

  head.appendChild(styleElement);
  return styleElement;
}

export function applyRootVarsToStyleElement(id: string, vars: CssVarMap): boolean {
  const styleElement = ensureThemeStyleElement(id);
  if (!styleElement) return false;

  const cssText = serializeVarsToCssText(vars);
  if (styleElement.textContent === cssText) {
    return false;
  }

  styleElement.textContent = cssText;
  return true;
}
