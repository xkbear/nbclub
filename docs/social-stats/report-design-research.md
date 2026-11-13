# 邮件图表方案检索与采用

检查日期：2026-09-30。目标：现有官方数据自动生成邮件，无需付费服务、公开图床或新网站。

## 实际检索范围

skill-scout 搜索 `data visualization`，完成选定的 15 个 GitHub 注册源、23/23 任务。4 个直接适配器实际成功：ClawHub、skills.sh、SkillHub 有结果，ClaudeSkills.info 成功但为空。另行执行 ClawHub CLI，返回 8 个结果。此轮跳过 71 个注册条目；SkillsMP、ClaudeMarketplaces、LobeHub、Tessl、Agensi 的 health-only 条目未检索。注册表部分健康记录为 09-08，不证明全部来源当前可用。

检查 OpenAI `openai/skills` 真实目录和 `jupyter-notebook/SKILL.md`，Anthropic `anthropics/skills` 目录和 `xlsx/SKILL.md`。分别面向分析笔记本和表格交付，不直接适合本次邮件。猜测的 OpenAI spreadsheet 路径返回 404，已改查真实目录，未据此断言整个平台没有分析能力。

## 选定的现成方法

| 来源与类型 | 实际检查 | 本地采用 |
|---|---|---|
| [Matplotlib skill](https://github.com/tvhahn/matplotlib-skill)，MIT skill | `skills/matplotlib/SKILL.md`、style-reference、P3-time-series、LICENSE | 吸收关键数字标注、单位、柱图零基线、减少装饰及导出后视觉检查。使用官方 Matplotlib 包；不运行候选仓库脚本。 |
| [Email HTML MJML skill](https://github.com/framix-team/skill-email-html-mjml)，MIT skill | `email-html-mjml/SKILL.md`、LICENSE | 吸收单栏、表格、内联样式、手机适配、图片说明、纯文本兜底。复用 Django，不增加 MJML 服务。 |
| 本机 email-marketing-bible | SKILL.md | 吸收邮件宽度、信息层级与替代文字规范。 |
| NewBee 已有邮件简报 | digest-weekly.html、render-digest.py、inline-attachments.mjs | 改编已有品牌配色、布局及 CID 图片方法，直接复用发件邮箱。 |

上游 Git blob：Matplotlib SKILL `40adc58e986d089cbf6f5ef3da7dafd10e030571`，style-reference `0f56cb4fb5141b5e10f438b9900cff6258dc5d84`，P3 `71de035ee04fe8386f4f4662bdde3955e0acd1fa`；邮件 SKILL `4617fd649582c1df5662db28d51b0bb0ee09fc4b`。

两个 URL family resolver 未成功读取 GitHub 页面，改查真实仓库目录；不能断言能力族完整。Matplotlib 本地种子恢复仅得到同作者其他仓库的未确认关联，不作为采用依据。无需安装全局新 skill：上述方法已落实在本项目代码中。

## 数据与验证

- [微信发表内容概览官方定义](https://developers.weixin.qq.com/doc/service/api/wedata/news/api_getbizsummary.html)已核对。日阅读人数不相加为周去重人数。
- 缺关注增减明细保留缺失；用官方周前后快照计算净变化时注明口径。相伴变化不写成因果关系。
- 本地 PNG 图表和 Logo 随邮件附带，无外部图床或图表服务。
- 12 项测试通过，覆盖单人测试、不占正式发送记录、MIME 引用完整、缺 Logo 阻止发送、缺数不造零。
- 真实 09-21 至 09-27 数据已检查桌面和 390px 手机宽度；无横向溢出，三张图均加载。浏览器预览不证明全部邮件客户端兼容，实际邮箱测试仍需用户核对。
