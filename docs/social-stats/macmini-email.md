# NewBee Mac Mini 公众号邮件周报

当前 NewBee Mac Mini 已确认不自动休眠、可直连外网。该方案每天在 Mac 本地运行公众号只读采集，周报每周只发送一次；不需要上线看板、开放入站端口或配置 `stats.new-bee.club`。视频号仍等待官方授权接口，不会写入假数据。

**2026-09-30 当前状态：** 公众号官方接口已接通并回填 2026-09-17 至 09-29；已批准 IP、私有密钥、五位收件人及现有 Titan 发件账号均在 Mac Mini 上验证。用户级定时任务已加载并完成一次只同步、不发信的演练；数据库备份已生成。首封邮件定于 2026-10-05 周一上午，报告 09-28 至 10-04。此前不会补发旧周报。

## 上线前一次性准备

1. 向 David 提供**部署当天**从 Mac Mini 直连外网检测到的 IPv4，让他只在公众号后台的「设置名单」里**追加**，不要删除原有地址。当前检测值不能证明运营商长期不换 IP。若换 IP，任务会停止采集；发件邮箱可用时会给维护者发异常邮件。程序不能自动改公众号后台名单。
2. Mac Mini 已有 NewBee 邮件简报的 Titan 发件账号 `news@new-bee.club`，周报复用其本机 Keychain 配置，不用另申请邮箱或传授权码。五位收件人 Ally、Pin、Harry、David、Fred 以 Harry 最新提供的邮箱为准，只放进本机 `report.env`，不进仓库。公众号 AppSecret 仍需在本机配置，不发聊天。可参考 [`report.env.example`](../../apps/social-stats/deploy/macmini/report.env.example)。
3. 邮件默认在 Mac Mini 本地时间每天 14:30 执行一次。奥克兰冬令时对应北京时间 10:30，夏令时对应 09:30。每日刷新近 7 日；若上周邮件尚未发送，会回查完整的上周，取得周末关注总数后发送。没有数据时不发空周报；每日缺数显示「暂无数据」，不当作 0。邮件发送记录保存在本机 SQLite，防止正常重试重复发送。每次成功运行后会在本机保存一份数据库备份，保留 30 天。

## 部署（由技术侧执行）

2026-10-01 收尾复验：次要增减或内容接口失败不再阻止已经取得本次官方关注快照的周报，邮件注明同步失败、保留已有真实数据、缺数不记为零。关注接口失败或只有以前成功的状态时仍不发。14 项测试及异质代码复审通过；完整需求完成审查因 transcript 载体问题为 inconclusive，见收尾报告。

周报包含 NewBee Logo、关注总数与净增指标卡、每日关注折线图和内容阅读柱图。图片作为邮件内嵌附件发送，不依赖公开图床；同时保留纯文本版本。

调试时使用 `manage.py send_weekly_report --preview-dir /私有目录/preview` 写入 HTML 和图片，不发信；使用 `--test-to 单个邮箱` 发送同一渲染流程的测试邮件，收件人仅该邮箱，不创建正式发送记录。正式任务继续使用本机五人名单。两种参数无需修改收件配置。

在固定目录检出已审查的代码，进入 `apps/social-stats`，安装 `requirements.txt`，并执行 `manage.py migrate`。将 `deploy/macmini/report.env.example` 复制到 `~/Library/Application Support/NewBeeSocialStats/report.env`，填写实际值，设置文件权限为 `0600`。`DASHBOARD_SECRET_KEY` 可用 `python3 -c 'import secrets; print(secrets.token_urlsafe(64))'` 生成。将数据库目录设为仅当前用户可读。

首次接通前，在本机重新检测直连 IPv4，和 David 加入的地址核对一致，再手动运行一次 `manage.py sync_wechat --days 1`，核对官方数据。然后执行 `manage.py send_weekly_report --dry-run` 检查邮件内容；只有发件邮箱与收件人名单核对完毕后，才手动发送一次并安装定时任务。

`deploy/macmini/club.new-bee.social-stats-mail.agent.plist.template` 是当前 Mac Mini 使用的用户级 `launchd` 模板，与已有 NewBee 邮件简报任务相同。将应用和日志目录绝对路径替换占位符，安装到 `~/Library/LaunchAgents/club.new-bee.social-stats-mail.plist`，再运行 `launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/club.new-bee.social-stats-mail.plist`。任务在该用户已登录时按本机时间每天 14:30 运行，能读取该用户 Keychain 中已有的邮件凭据；Mac 重启后该用户需要重新登录。安装后检查 `launchctl print gui/$(id -u)/club.new-bee.social-stats-mail` 和本机日志。不要在密钥、白名单、发件邮箱和收件人尚未验证时加载定时任务。

若以后需要在用户退出登录后继续运行，可评估 `deploy/macmini/club.new-bee.social-stats-mail.plist.template` 的系统级模板；切换前必须另外验证系统任务能否读取邮件凭据，避免无凭据定时失败。

后续改收件人只改本机配置；改共享邮件内容只改程序。若 IP 变化，先由 David 更新公众号名单，再修改 `WECHAT_ALLOWED_EGRESS_IPV4` 并重试。Mac Mini 停机、断网或邮件服务失败时，查看日志；不要把未送达邮件说成已发。本机备份不能防止整台 Mac 丢失，必要时用团队已有的私有备份方式再保留异地副本。
