const copy = {
  title: '应用启动失败',
  description: '初始化过程中发生异常，请检查代码配置、依赖安装与启动日志。',
  suggestion: '建议优先检查 apps/zfw-system-sfss/src/config/app.ts 与 .env 配置，再重新执行 build 或 preview。',
  unknownErrorText: '未知错误'
};

const style = {
  containerBackground: '#f5f7fa',
  cardBackground: '#ffffff',
  cardShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
  titleColor: '#111827',
  descriptionColor: '#4b5563',
  suggestionColor: '#1d4ed8',
  detailBackground: '#f3f4f6',
  detailColor: '#b91c1c'
};

function buildErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return copy.unknownErrorText;
}

export function renderBootstrapError(error: unknown) {
  const appRoot = document.querySelector('#app');
  if (!appRoot) {
    return;
  }

  const container = document.createElement('div');
  container.style.minHeight = '100vh';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.justifyContent = 'center';
  container.style.background = style.containerBackground;
  container.style.padding = '24px';

  const card = document.createElement('div');
  card.style.maxWidth = '720px';
  card.style.width = '100%';
  card.style.background = style.cardBackground;
  card.style.borderRadius = '12px';
  card.style.boxShadow = style.cardShadow;
  card.style.padding = '24px';

  const title = document.createElement('h2');
  title.textContent = copy.title;
  title.style.margin = '0 0 12px';
  title.style.fontSize = '20px';
  title.style.color = style.titleColor;

  const desc = document.createElement('p');
  desc.textContent = copy.description;
  desc.style.margin = '0 0 12px';
  desc.style.color = style.descriptionColor;

  const suggestion = document.createElement('p');
  suggestion.textContent = copy.suggestion;
  suggestion.style.margin = '0 0 12px';
  suggestion.style.color = style.suggestionColor;

  const detail = document.createElement('pre');
  detail.textContent = buildErrorMessage(error);
  detail.style.margin = '0';
  detail.style.padding = '12px';
  detail.style.background = style.detailBackground;
  detail.style.borderRadius = '8px';
  detail.style.color = style.detailColor;
  detail.style.whiteSpace = 'pre-wrap';
  detail.style.wordBreak = 'break-word';

  card.append(title, desc, suggestion, detail);
  container.append(card);
  appRoot.replaceChildren(container);
}
