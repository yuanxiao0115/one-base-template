import { startAdminApp, type StartAdminAppBeforeMountContext } from './bootstrap/startup';
import './styles/team-overrides.css';

function installMainEntrypointPlugins({ app }: StartAdminAppBeforeMountContext) {
  // 团队扩展入口：可在 main.ts 继续使用 app.use(...)，避免改动 bootstrap 内核。
  // app.use(YourPlugin, yourOptions);
  void app;
}

void startAdminApp({
  beforeMount: installMainEntrypointPlugins
});
