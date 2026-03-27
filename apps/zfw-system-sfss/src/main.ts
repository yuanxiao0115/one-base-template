import {
  startZfwSystemSfssApp,
  type StartZfwSystemSfssAppBeforeMountContext
} from './bootstrap/startup';

function installMainEntrypointPlugins({ app }: StartZfwSystemSfssAppBeforeMountContext) {
  // 团队扩展入口：可在 main.ts 继续使用 app.use(...)，避免改动 bootstrap 内核。
  // app.use(YourPlugin, yourOptions);
  void app;
}

void startZfwSystemSfssApp({
  beforeMount: installMainEntrypointPlugins
});
