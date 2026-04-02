# zfw-system-sfss 迁移源说明

## 目录用途

- `System-sfss-legacy-src.tar.gz`：来自老项目 `src/views/System-sfss` 的原始迁移源压缩包。
- 应用内以压缩包形式保留迁移源，避免 legacy 代码进入 app lint/typecheck 扫描。

## 当前迁移策略

1. 在 `src/modules/system-sfss/routes.ts` 先对齐老项目 URL 路径，保障登录与菜单链路可直接联调。
2. 页面先以可运行占位页接入，后续按业务优先级逐页从压缩包解压目录回填。
3. 每次回填至少跑 `typecheck + lint + lint:arch + build`，确保不回退基座规范。
