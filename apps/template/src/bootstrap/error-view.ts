function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : '未知错误';
}

export function renderBootstrapError(error: unknown) {
  const appRoot = document.querySelector<HTMLDivElement>('#app');
  if (!appRoot) {
    return;
  }

  appRoot.innerHTML = `
    <div style="min-height:100%;display:flex;align-items:center;justify-content:center;background:#f5f7fa;padding:24px;">
      <div style="width:100%;max-width:680px;background:#fff;border-radius:12px;padding:24px;box-shadow:0 8px 24px rgba(0,0,0,.08)">
        <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">Template 启动失败</h2>
        <p style="margin:0 0 12px;color:#4b5563;">请检查 apps/template/src/config/platform-config.ts 配置。</p>
        <pre style="margin:0;padding:12px;background:#f3f4f6;border-radius:8px;white-space:pre-wrap;color:#b91c1c;">${escapeHtml(toErrorMessage(error))}</pre>
      </div>
    </div>
  `;
}
