# 论文原创表达诊断与优化系统

这是一个本地运行的“静态前端 + Node.js 代理”MVP，用于帮助作者发现论文中的模板化、空泛化、证据不足、结构机械和占位符残留等表达质量问题，并保留人工修改记录。

## 项目类型

- 前端网页：原生 HTML、CSS、JavaScript，无打包器。
- 本地后端：Node.js 内置 http 模块提供静态文件和可选模型代理。
- 文档项目：根目录保留 PRD 和 MVP 开发说明书 DOCX。

## 功能与边界

- 粘贴文本、按自然段诊断、风险高亮、建议处理、人工编辑和 Markdown 报告导出。
- 默认使用本地规则；可选调用 OpenAI-compatible 模型增强诊断。
- 不承诺降低任何 AIGC 检测分数，不提供规避审查策略，也不编造文献、数据、访谈、政策或案例。
- 当前不包含 Word 上传解析、账户系统、历史记录、数据库和后台管理。

## 快速开始

环境要求：Node.js 18+ 和现代浏览器。项目没有第三方运行时依赖，不需要 npm install。

```powershell
cd .\mvp-app
node server.js
```

打开 http://127.0.0.1:8787。Windows 也可以运行 mvp-app\start-site.bat。

服务默认只监听回环地址。若设置 HOST 暴露到其他地址，请自行配置防火墙和访问控制：

```powershell
$env:HOST = "127.0.0.1"
$env:PORT = "8787"
node .\mvp-app\server.js
```

## 模型配置与隐私

页面中的模型增强配置使用用户自己提供的 API Key、Base URL 和模型名。密钥不会写入代码；默认不会保存到浏览器 localStorage，只有主动勾选“记住到本机浏览器”才会保存。非本机模型地址必须使用 HTTPS，且不应填写不受信任的地址。

启用模型增强后，论文段落会发送到用户填写的模型服务。请不要提交未授权的个人信息、未公开研究资料、健康/财务数据或受保密协议约束的内容。模型服务商的数据留存、训练和跨境传输政策需要使用者自行确认。

## 目录结构

```text
.
├─ mvp-app/                 # 可运行应用
│  ├─ index.html            # 页面结构
│  ├─ app.js                # 规则诊断、交互和模型请求
│  ├─ styles.css            # 样式
│  ├─ server.js             # 静态服务和模型代理
│  └─ start-site.bat        # Windows 启动脚本
├─ docs/                    # 使用和架构说明
├─ release/                 # 已清理元数据的上传版 DOCX
├─ 论文AI味诊断与原创表达优化系统_PRD.docx  # 原始文件，不纳入上传
└─ 论文AI味诊断与原创表达优化系统_MVP开发说明书.docx
```

## 验证

```powershell
node --check .\mvp-app\server.js
node --check .\mvp-app\app.js
```

当前没有自动化测试、依赖锁文件或 CI。发布前请手工验证本地规则诊断、模型错误回退、报告导出和不同浏览器的界面行为。

## 贡献、许可证和安全

贡献方式见 CONTRIBUTING.md，漏洞报告见 SECURITY.md。当前按私有仓库准备，不添加开源许可证；如果以后改为 Public，再按 LICENSE-CHOICE.md 选择许可证。发布前审计见 SECURITY_AUDIT.md 和 OPEN_SOURCE_CHECKLIST.md。

