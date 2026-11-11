# 贡献指南

## 开始前

- 先阅读 README.md、docs/usage.md 和 SECURITY_AUDIT.md。
- 不要提交 API Key、Token、Cookie、私钥、真实论文、个人信息或未脱敏业务数据。
- 不要改变“不得编造事实、不得承诺规避检测”的产品边界。

## 修改流程

1. 在独立分支完成修改。
2. 保持 Node.js 18+ 兼容，不引入不必要的依赖。
3. 运行 node --check mvp-app/server.js 和 node --check mvp-app/app.js。
4. 手工验证规则诊断、模型失败回退、报告导出和密钥保存开关。
5. 在提交说明中写清影响范围、隐私影响和验证结果。

## 提交内容

提交前请检查 git diff --cached，确认没有凭证、真实数据、构建产物或本机路径。安全问题请按 SECURITY.md 的方式私下报告，不要直接公开利用细节。
