# NewBee Mac Mini 公众号邮件周报

当前 NewBee Mac Mini 已确认不自动休眠、可直连外网。该方案每天在 Mac 本地运行公众号只读采集，周报每周只发送一次；不需要上线看板、开放入站端口或配置 `stats.new-bee.club`。视频号仍等待官方授权接口，不会写入假数据。

## 上线前一次性准备

1. 向 David 提供**部署当天**从 Mac Mini 直连外网检测到的 IPv4，让他只在公众号后台的「设置名单」里**追加**，不要删除原有地址。当前检测值不能证明运营商长期不换 IP。若换 IP，任务会停止采集；发件邮箱可用时会给维护者发异常邮件。程序不能自动改公众号后台名单。
2. Mac Mini 已有 NewBee 邮件简报的 Titan 发件账号 `news@new-bee.club`，周报复用其本机 Keychain 配置，不用另申请邮箱或传授权码。五位收件人 Ally、Pin、Harry、David、Fred 以 Harry 最新提供的邮箱为准，只放进本机 `report.env`，不进仓库。公众号 AppSecret 仍需在本机配置，不发聊天。可参考 [`report.env.example`](../../apps/social-stats/deploy/macmini/report.env.example)。
3. 邮件默认在 Mac Mini 本地时间每天 14:30 执行一次。奥克兰冬令时对应北京时间 10:30，夏令时对应 09:30。每日刷新近 7 日；若上周邮件尚未发送，会回查完整的上周，取得周末关注总数后发送。没有数据时不发空周报；每日缺数显示「暂无数据」，不当作 0。邮件发送记录保存在本机 SQLite，防止正常重试重复发送。每次成功运行后会在本机保存一份数据库备份，保留 30 天。

## 部署（由技术侧执行）

在固定目录检出已审查的代码，进入 `apps/social-stats`，安装 `requirements.txt`，并执行 `manage.py migrate`。将 `deploy/macmini/report.env.example` 复制到 `~/Library/Application Support/NewBeeSocialStats/report.env`，填写实际值，设置文件权限为 `0600`。`DASHBOARD_SECRET_KEY` 可用 `python3 -c 'import secrets; print(secrets.token_urlsafe(64))'` 生成。将数据库目录设为仅当前用户可读。

首次接通前，在本机重新检测直连 IPv4，和 David 加入的地址核对一致，再手动运行一次 `manage.py sync_wechat --days 1`，核对官方数据。然后执行 `manage.py send_weekly_report --dry-run` 检查邮件内容；只有发件邮箱与收件人名单核对完毕后，才手动发送一次并安装定时任务。

`deploy/macmini/club.new-bee.social-stats-mail.plist.template` 是系统级 `launchd` 模板。用实际用户名、用户主目录、应用绝对路径和日志目录替换四个占位符；创建仅本机用户可写的日志目录，将生成文件以 `root:wheel`、`0644` 安装到 `/Library/LaunchDaemons/club.new-bee.social-stats-mail.plist`，再运行 `sudo launchctl bootstrap system /Library/LaunchDaemons/club.new-bee.social-stats-mail.plist`。任务以指定普通用户身份运行，退出桌面登录后仍可按时执行。安装后检查 `sudo launchctl print system/club.new-bee.social-stats-mail` 和本机日志。不要在密钥、白名单、发件邮箱和收件人尚未验证时加载定时任务。

后续改收件人只改本机配置；改共享邮件内容只改程序。若 IP 变化，先由 David 更新公众号名单，再修改 `WECHAT_ALLOWED_EGRESS_IPV4` 并重试。Mac Mini 停机、断网或邮件服务失败时，查看日志；不要把未送达邮件说成已发。本机备份不能防止整台 Mac 丢失，必要时用团队已有的私有备份方式再保留异地副本。
