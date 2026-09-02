# NewBee AI Club 先蜂AI俱乐部

> 好奇心 · 创造力 · 致良知

NewBee AI Club 是一个由华人 AI 学习者、实践者及跨领域从业者共同参与的非营利性社群。

## 📄 白皮书

- [官方网站](https://new-bee.club/)
- [下载 Word 文档](docs/NewBee_AI_Club_白皮书_最终修订版.docx)

## 🔎 地区与活动入口

- [新西兰AI俱乐部](https://new-bee.club/xin-xilan-ai-club.html)
- [华人AI俱乐部 NZ](https://new-bee.club/chinese-ai-club-nz.html)
- [新西兰 AI 聚会与活动日历](https://new-bee.club/events.html)
- [新西兰AI爱好者学习入口](https://new-bee.club/ai-enthusiasts-new-zealand.html)
- [协会、俱乐部与社群的组织性质说明](https://new-bee.club/new-zealand-ai-association.html)

机器可读入口包括 [`sitemap.xml`](sitemap.xml)、[`feed.xml`](feed.xml)、[`llms.txt`](llms.txt) 和 [`llms-full.txt`](llms-full.txt)。

提交前运行：

```bash
node scripts/seo-check.mjs
xmllint --noout sitemap.xml feed.xml
```

当前由 `main` 分支根目录发布到 GitHub Pages。页面内已设置 CSP 与 Referrer Policy；GitHub Pages 不支持通过仓库文件自定义 `X-Content-Type-Options`、`X-Frame-Options` 等 HTTP 响应头，如需完整响应头必须在域名前增加可配置的边缘/CDN 层或迁移托管平台。

## 🎯 使命

消除认知壁垒，让每一位华人成为 AI 时代的创造者，而非旁观者。

## 🌏 愿景

建设一个开放、可信、长期主义的华人 AI 学习与实践社群，促进不同背景参与者在 AI 时代实现持续学习、经验共享与协作成长。

---

*Curiosity · Creativity · Conscience*
