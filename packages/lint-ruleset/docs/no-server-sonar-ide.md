# SonarQube for IDE（无服务端）使用说明

## 适用场景

- 没有 SonarQube Server / Cloud 项目
- 希望在 IDE 中实时看到 Sonar 类问题

## 操作步骤

1. 在 VS Code 安装扩展：`SonarQube for IDE`
2. 不配置 Connected Mode，保持 standalone 模式
3. 打开 JS/TS/CSS/Vue 文件并保存，查看编辑器提示与 Problems 面板
4. 修复后再次保存，确认问题消失

## 注意事项

- standalone 模式不会同步团队 Quality Profile
- 规则覆盖度低于服务端模式
- 建议把 ESLint + Stylelint + Csslint 脚本作为 CI 主门禁
