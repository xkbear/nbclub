## 🎯 北极星（原始终局，逐棒原样传递）

自动监测 NewBee 公众号、视频号等获授权后台数据，按日积累，让秘书组持续看到关注变化和内容表现，避免人工输入和重复建设。当前已选择 NewBee Mac Mini 自动取数、每周图表邮件；不用新增云账号，不上线内部网页。小红书暂缓，视频号只有正式授权后才接入。

## 到哪了

- 主仓库 `xkbear/nbclub`，工作检出 `nbclub-social-stats-foundation`，分支 `codex/social-stats-foundation`，PR #1。公众号 Django 应用在 `apps/social-stats`。
- 官方接口已连接并回填真实数据。图表邮件包含 Logo、关注总数/净增/增长率、每日关注折线图、阅读柱图和峰值日互动。PNG/CID 随邮件附带，不用公开图床。
- Harry 收到图表版测试；随后获授权向 Ally、Pin、David、Fred 分别发送 Review 测试，SMTP 均受理。尚无其他人的主动反馈记录。测试不写正式发送记录。
- 用户级任务 `club.new-bee.social-stats-mail` 每日奥克兰时间 14:30 运行。用户须保持登录，Mac 不休眠；重启后重新登录。首个正式周期结束日 10-04，计划 10-05 发 09-28 至 10-04 周报。此前只取数，不补发旧周报。
- 发件复用现有 NewBee 简报的 Titan/Keychain。AppSecret 由 David 重置、Harry 在隐藏输入框录入，私有配置权限 0600。Pin 没有使用旧密钥（Harry 已纠正）。不再问 David 索取截图或重置密钥。

## 下一步（主线顺序）

1. 等待用户主动带来秘书组反馈；必要时针对邮件排版修改，继续单收件人测试。
2. 10-05 核对首期任务、五人邮件受理和本机 ReportDelivery；不能把尚未发生的首期发送标为已验证。
3. 仅在获得腾讯明确授权资料后评估视频号连接器。账号自动化边界仍有效。
4. PR #1 合并由团队处理；运行检出目前直接用 PR 分支。部署读取此目录，勿为了追 main 切走运行分支。

## 运行与恢复入口

- 任务脚本：`apps/social-stats/deploy/macmini/run-report.sh`。
- 本机私有目录：`~/Library/Application Support/NewBeeSocialStats/`，含 report.env、数据库、backups；不得输出密钥内容。
- 任务日志：`~/Library/Logs/NewBeeSocialStats/report.log` 和 report-error.log。
- 查任务：`launchctl print gui/$(id -u)/club.new-bee.social-stats-mail`；严格 plist 解析见 Mac Mini 文档。
- 所有外发须沿用用户授权；读取状态、预览和测试已足够时不要发重复 Review 邮件。
- 次要增减/内容接口失败不会无期限拦住关注周报；只有本次已成功取得官方关注快照才继续，邮件标出次要同步失败。关注接口失败仍不发。

## 本轮边界与证据

代码审查、契约对账、需求逐条记录及未完成项见 `SIGNOFF-2026-10-01.md` 和根目录 PROJECTS.md。本轮 completion bundle 因原始消息载体覆盖不完整而不可生成；独立代码审查不能替代独立需求完成审查，完成度保持 inconclusive。原始 transcript 和本机 SMTP/测试回执不上传公开仓库。

较低优先级审查建议已放入 PROJECTS.md 的 BACKLOG，不在收尾中继续扩展实现。
