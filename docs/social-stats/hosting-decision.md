# 内部数据看板的零费用优先运行方案（待开通）

日期：2026-09-29。这里是方案比较，不代表已经注册云账号、购买服务、部署或接入公众号。

## 为什么仍需要一个运行位置

官网 `new-bee.club` 当前是 GitHub Pages 静态站。它可以展示网页，但每日自动读取公众号接口需要定时运行的服务端、私密保存 AppSecret、保存历史数据，以及符合公众号要求的固定出口 IP。GitHub 协作者权限只覆盖官网代码，不附带这些运行能力。首期仍是公众号与视频号，小红书暂缓。

## 首选：Oracle Cloud Always Free 云主机

在免费额度内用一台小型 Linux 虚拟机运行每日采集、内部登录看板和私有数据库。Oracle 官方列有长期免费的 VM、存储与公网 IP。实例运行期间的公网 IP 可用于公众号白名单；若账户内可免费保留一个固定公网 IP，就优先使用保留地址，避免机器重建时重新配置。AppSecret 只存服务端，不进网页、聊天或公开仓库。看板验证后把 `stats.new-bee.club` 指向该机器，并用免费 HTTPS 证书。

此路线没有月度订阅费，但**不能保证免费资源随时有货或永不回收**：Oracle 明确说明，免费实例所在区域可能暂时没有容量；长期低负载的免费机器也可能被回收。注册通常需要手机号和信用卡，Oracle 说明未升级付费账号时不会因注册本身扣费。还需要我们自己负责系统更新、备份和故障恢复。主机若被回收，看板必须显示同步中断；不能把旧数据冒充今日数据。

## 比较过的方案

| 方案 | 结论 |
| --- | --- |
| Oracle Always Free | 可在免费额度内同时承载定时采集和私有看板，优先尝试；需确认账号资格、可用容量、公网 IP 及长期运行状态。 |
| 现有 GitHub Pages | 继续承载公开官网；不能私密保存公众号密码或定时采集。 |
| 腾讯云微搭免费体验版 | 免费档没有固定出口 IP、微信生态连接器或自定义域名；不满足本方案的完整条件。 |
| 现有 Vercel/Supabase 看板 | 前端可复用设计；Supabase Edge Functions 无固定出口 IP。Vercel Pro 的 Static IPs 附加项标价 100 美元/项目/月，另有 Pro 订阅及传输费用。 |
| Railway Pro | 技术上合适但需 20 美元/月订阅，含资源用量抵扣；仅在免费路线无法稳定运行且用户另行决定时考虑。 |

## 一次性外部动作（等开发侧准备完成后）

1. Harry/Pin：由谁持有免费的 Oracle 云账号；注册需要的手机号和信用卡由账号所有者本人操作。确认内部看板的查看人员。
2. 公众号管理员 DAVID：按开发侧给出的具体 IP 和步骤设置白名单；如果旧 AppSecret 确实无法取得且确认没有旧系统使用，再重置一次，并在安全配置界面直接保存新密钥。运营人员无需研究这些技术项。
3. 域名管理员：在测试地址验证后，为 `stats.new-bee.club` 添加实际部署环境所需的 DNS 记录。记录值必须在实例创建后取得，不能预先猜测。

## 开通前开发侧完成

- 采集代码只调用已授权的官方只读接口；先验证一日数据和账号权限，再打开每日任务。
- 私有数据表、登录、备份、同步失败告警与看板缺失值状态完成并本地验证。
- 形成一页管理员操作清单，写明点击位置、实际 IP、密钥录入位置和回退方法；不要求运营人员做技术判断。
- 在 Oracle 控制台实际显示免费资格和价格前，不创建可能收费的资源；若免费资源无法取得，保留可迁移部署包，不自动改用付费平台。

## 官方依据

- [腾讯云：公众号 API 与 IP 白名单](https://cloud.tencent.com/document/product/1301/100187)
- [Oracle：Always Free 资源、容量和回收规则](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)
- [Oracle：免费账号注册与信用卡说明](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier.htm)
- [Oracle：公网 IP 类型](https://docs.oracle.com/en-us/iaas/Content/Network/Tasks/managingpublicIPs.htm)
- [腾讯云：免费档功能对照](https://cloud.tencent.com/document/product/1301/133852)
- [Supabase：Edge Functions 无固定出口 IP](https://supabase.com/docs/guides/troubleshooting/why-supabase-edge-functions-cannot-provide-static-egress-ips-for-whitelisting-3d78b0)
- [Vercel：Static IPs 价格](https://vercel.com/pricing)
- [Railway：价格与资源抵扣](https://docs.railway.com/pricing/plans)
