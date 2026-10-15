# NewBee 内部社交数据看板

当前首选是在 **NewBee Mac Mini 上每日取数、每周自动发邮件**；配置见[Mac Mini 邮件方案](../../docs/social-stats/macmini-email.md)。程序也保留了原先的内部看板：公众号官方只读接口每日采集、共享密码访问、14 日趋势、近 7 个完整统计日的汇总、来源及同步状态。视频号保留“等待官方接口”状态。小红书不接入。

**2026-10-01 状态：官方接口已接通，真实数据已保存，AppSecret 位于本机私有配置，每日任务已启用。** 图表版测试邮件已发给五位指定收件人供 review；正式周报仍按 10-05 首发规则运行。GitHub Pages 公开官网继续独立运行；邮件方案无需网页或新子域名。下方 Linux 看板步骤仅为备选。当前状态及未完成验证见[续接说明](../../docs/social-stats/NEXT-CHAT.md)。

## 数据口径

| 指标 | 官方接口 | 口径 |
| --- | --- | --- |
| 关注总数 | `getusercumulate` | 统计日末累计关注人数 |
| 新增关注、取消关注 | `getusersummary` | 将所有 `user_source` 渠道行相加；`user_source=0` 只是“其他合计”渠道，不是全部 |
| 发表内容阅读、分享、点赞、留言、发表篇数 | `getbizsummary` | 按**内容发表日期**归集的概览数据；可能随平台补算而修订，不等于全部历史文章在该日发生的阅读 |

当接口没有该日记录时，不把它当成 0。接口返回 `is_delay=true` 时保留已存数据并标明失败。每日任务回查过去 7 个完整统计日，以接收平台补算。周汇总仅在所有 7 日都有相应指标时显示。视频号的普通创作者数据不调用未获授权的接口。

官方接口说明：[累计用户](https://developers.weixin.qq.com/doc/service/api/wedata/user/api_getusercumulate)、[用户增减](https://developers.weixin.qq.com/doc/service/api/wedata/user/api_getusersummary)、[发表内容概况](https://developers.weixin.qq.com/doc/service/api/wedata/news/api_getbizsummary)、[稳定版调用凭据](https://developers.weixin.qq.com/doc/service/api/base/api_getstableaccesstoken)。

## 本地检查

```sh
cd apps/social-stats
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
mkdir -p data
DASHBOARD_DEBUG=1 .venv/bin/python manage.py migrate
DASHBOARD_DEBUG=1 .venv/bin/python manage.py test
DASHBOARD_DEBUG=1 .venv/bin/python manage.py set_viewer_password
DASHBOARD_DEBUG=1 .venv/bin/python manage.py runserver
```

打开 `http://127.0.0.1:8000/` 后只输入共享密码。没有真实数据时看板会如实显示“暂无数据”。本地检查无需公众号密钥，也不会触碰真实账号。真实同步只能在已加入微信白名单的服务器上运行。

## 可选：独立网页看板部署

先检查团队是否已有可复用的常开 Linux 服务器，要求是稳定公网出口 IP、能运行 Python 和定时任务、可安全保存密钥，并能提供 HTTPS。**`new-bee.club` 本身由 GitHub Pages 托管，没有这些运行能力**；看板仍可用 `stats.new-bee.club` 作为官网子域名。若没有现成服务器，备选是一台 Oracle Cloud Always Free Linux VM；**只有在控制台明确标为 Always Free、预计费用为 0、且公网 IP 类型仍在免费范围内时才创建。** 容量和账号资格需以当时控制台为准。下列步骤在主机就绪、拿到公网 IP 之后执行；优先使用可长期保留的 IP，避免重建后重新改微信白名单。

1. 将 22、80、443 端口在服务器防火墙开放；若使用云主机，还要调整云防火墙。SSH 22 只允许管理员已知地址时更好。设置 `stats.new-bee.club` 的 DNS A 记录指向实际公网 IP。不要改动 `new-bee.club` 官网现有记录。
2. 在 Ubuntu VM 安装 `git`、`python3-venv`、`python3-pip` 和 Caddy；使用发行版或 [Caddy 官方安装说明](https://caddyserver.com/docs/install)。
3. 在 VM 执行：

```sh
sudo useradd --system --create-home --shell /usr/sbin/nologin newbee-stats
sudo mkdir -p /opt/newbee-social-stats /var/lib/newbee-social-stats
sudo chown -R newbee-stats:newbee-stats /opt/newbee-social-stats /var/lib/newbee-social-stats
sudo -u newbee-stats git clone --filter=blob:none --sparse https://github.com/xkbear/nbclub.git /opt/newbee-social-stats
sudo -u newbee-stats git -C /opt/newbee-social-stats sparse-checkout set apps/social-stats
cd /opt/newbee-social-stats/apps/social-stats
sudo -u newbee-stats python3 -m venv .venv
sudo -u newbee-stats .venv/bin/pip install -r requirements.txt
```

   这段命令以代码已合入默认分支为前提。首次部署前按 `git status` 和 GitHub 提交核对版本。

4. 由服务器管理员在 `/etc/newbee-social-stats.env` 写入 `.env.example` 中的变量。用 `python3 -c 'import secrets; print(secrets.token_urlsafe(64))'` 生成 `DASHBOARD_SECRET_KEY`。**AppSecret 只在服务器终端录入；不要发到聊天、工单、GitHub 或截图。** 文件权限设为 `root:newbee-stats`、`0640`。在拿到 AppSecret 之前，可以先把 `WECHAT_APP_SECRET` 留空或不写，测试私有看板，但不要启用同步定时器。
5. 使用受限账号加载配置并初始化数据库、静态文件与登录账号：

```sh
sudo chown root:newbee-stats /etc/newbee-social-stats.env
sudo chmod 0640 /etc/newbee-social-stats.env
sudo -u newbee-stats sh -c 'set -a; . /etc/newbee-social-stats.env; set +a; cd /opt/newbee-social-stats/apps/social-stats; .venv/bin/python manage.py migrate; .venv/bin/python manage.py collectstatic --noinput; .venv/bin/python manage.py set_viewer_password'
sudo cp /opt/newbee-social-stats/apps/social-stats/deploy/newbee-social-stats*.service /etc/systemd/system/
sudo cp /opt/newbee-social-stats/apps/social-stats/deploy/newbee-social-stats*.timer /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now newbee-social-stats.service
```

   新主机可将 `deploy/Caddyfile` 复制到 `/etc/caddy/Caddyfile` 并启动 Caddy；**已有其他网站的服务器必须由管理员把该站点块合并进现有配置，不要覆盖配置文件**。若本机 `8001` 已被占用，在 systemd 服务和 Caddy 配置中一同换成空闲端口。Caddy 自动申请 HTTPS 证书；域名未指向主机前，它无法完成证书签发。先访问 `https://stats.new-bee.club/login/`，确认 HTTPS、登录及手机排版，再继续公众号接入。

6. 由公众号管理员按[一次性操作清单](../../docs/social-stats/admin-handoff.md)完成白名单和 AppSecret。开发侧在服务器上执行下面的**单日只读验证**；成功后才启用定时器：

```sh
sudo -u newbee-stats sh -c 'set -a; . /etc/newbee-social-stats.env; set +a; cd /opt/newbee-social-stats/apps/social-stats; .venv/bin/python manage.py sync_wechat --days 1'
sudo systemctl enable --now newbee-social-stats-sync.timer newbee-social-stats-backup.timer
systemctl list-timers 'newbee-social-stats*'
```

   任务在每日 **09:30 北京时间**运行，刷新前 7 天数据。初次验证成功后可额外运行 `sync_wechat --days 30` 回填最多 30 个已完成统计日。若官方账号权限不足，保留明确错误状态，不改用抓取。

7. 本机备份每天运行，保存 30 天，目录在 `/var/lib/newbee-social-stats/backups`。这是同机恢复点，**不能防主机或云账号丢失**。Oracle 官方列有 [20 GB Always Free Object Storage](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)；确认该账号仍在免费额度后，可建一个**私有**存储桶，给该 VM 建专属 dynamic group 和仅限该 bucket 的写入策略，安装 [OCI CLI](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliusing.htm)，并在环境文件加入 `OCI_BACKUP_BUCKET=桶名`。备份脚本会用 [instance principal](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliusing.htm) 自动上传，无需在 VM 存 OCI API 密钥。为桶设置 30 日自动删除规则并测试恢复。若不配置该变量，则只保存同机备份；不要把数据库传入公开仓库。

更新应用：在 VM 执行 `sudo -u newbee-stats git -C /opt/newbee-social-stats pull --ff-only`，再重新安装依赖、迁移、收集静态文件并 `systemctl restart newbee-social-stats.service`。上线前先看测试结果和迁移内容。

## 运维与权限

- 看板只有一个共享密码，查看者不需要各自注册账号。只把密码告诉需要看数据的人；泄露或人员变动时在服务器执行 `manage.py set_viewer_password` 更换密码，旧登录会话随之失效。密码以哈希形式保存，页面设置 `noindex` 和禁止缓存。
- 同步失败：`systemctl status newbee-social-stats-sync.service`、`journalctl -u newbee-social-stats-sync.service -n 100`；日志只输出接口错误码，不输出 AppSecret 或 access_token。
- 回退：停止同步 timer；旧数据仍可只读查看并标明过期。应用代码可回退到上一已验证提交，数据库回退前先做快照。
- 视频号：仅在腾讯确认普通创作者号可用的官方授权统计接口后开发连接器；目前不要求运营人员在后台寻找“密钥”。
