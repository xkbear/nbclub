# NewBee AI Club 先蜂AI俱乐部

> 好奇心 · 创造力 · 致良知

NewBee AI Club 是一个由华人 AI 学习者、实践者及跨领域从业者共同参与的非营利性社群。

## 📄 白皮书

- [官方网站](https://new-bee.club/)
- [完整白皮书](https://new-bee.club/whitepaper.html)
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

## 网站维护

- 共享样式与交互：`assets/site.css`、`assets/site.js`。
- 首页与活动列表：`assets/home.css`；活动正文：`assets/event-detail.css`。
- 地区指南：`assets/local-pages.css`；会员、白皮书与会歌：`assets/pages.css`。
- 中文页面使用一致的中文导航和 FAQ，英文介绍位于独立页面。
- 原白皮书完整保留在 `whitepaper.html`；首页原来的 `#s1`–`#s12` 链接会转到白皮书对应章节。
- 动效遵循系统减少动态效果设置；活动筛选、图片放大和横向浏览均为渐进增强。
- 深浅色由 `assets/site.css` 中的语义颜色变量统一管理；`assets/theme.js` 在样式加载前读取偏好，默认跟随系统，手动选择记入 `newbee-theme` 并跨页面、标签页同步。存储不可用时仍能切换当前页面。
- 首页活动每 5 秒自动前进一张，到边缘后平滑往返；卡片或底部控制栏可见时运行，离开视口、切换标签页或鼠标悬停时暂停。手动翻页后重新计时，键盘焦点离开活动区后恢复；只有点击暂停才持续暂停。点击播放立即前进一张并恢复定时播放。系统开启减少动态效果时默认不自动播放，但可点击播放主动启用无动画自动翻页。
- 会员服务表在宽屏保持四列对照，窄屏改为有字段标签的服务卡片，保留表格语义与全部权益文字。
- Google Forms 仍使用原有官方嵌入表单。跨域内容不改字段或提交逻辑，仅对 iframe 应用深色显示滤镜与浅色亮度调整。
- 会歌页播放完整原片 `assets/anthem.mp4`（1080 × 1080），不使用裁掉下半部分的 `anthem-lyrics.mp4`；播放器保持 1:1 和 `object-fit: contain`，完整保留 Logo 与文字，并随屏幕高度调整尺寸。
- 首页主图使用 640 / 1000 / 1672 像素响应式 WebP，原始选定图片不覆盖。可用 `node scripts/build-responsive-images.mjs` 重新生成（需安装 `sharp`，或传入已安装模块的路径）。
- 旧组织架构地址跳转至白皮书中的现行版本；`test.html` 仅预览当前首页，不再注入旧排版。
- 所有 Netlify 发布（包括预览发布与触发自动构建）必须先取得用户明确同意。

## 🎯 使命

消除认知壁垒，让每一位华人成为 AI 时代的创造者，而非旁观者。

## 🌏 愿景

建设一个开放、可信、长期主义的华人 AI 学习与实践社群，促进不同背景参与者在 AI 时代实现持续学习、经验共享与协作成长。

---

*Curiosity · Creativity · Conscience*
