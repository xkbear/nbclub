# 公众号自动取数与邮件周报的零费用优先运行方案

状态更新：2026-10-01。当前选择为[Mac Mini 邮件周报](macmini-email.md)，公众号官方取数、私有密钥、现有 Titan 发件邮箱和日任务均已验证。图表版测试邮件已发给 Harry 及其他四位秘书组成员供 review；正式周报首期仍待 10-05 验证。网页暂不部署，不需要 Oracle 账号或 DNS 配置。下方云平台比较是此前决策历史，不代表现在要开通，价格与资格不作长期保证。

## 为什么发邮件仍需要一个运行位置

官网 `new-bee.club` 当前是 GitHub Pages 静态站。发邮件可省去私有网页和新域名，但自动读取公众号接口仍需要定时运行的机器、私密保存 AppSecret、保存历史数据，以及公众号名单中可用的出口 IP。已确认 NewBee Mac Mini 可承担前面三项；当前公网 IPv4 可检测，但是否长期固定还不能凭一次检查证明。程序将在每次取数前核对，变动时停止同步并提示维护者。首期只有公众号，视频号等官方回复，小红书暂缓。

## 当前首选：NewBee Mac Mini 自动邮件

Mac Mini 不自动休眠，可每天取公众号数据并每周发邮件。David 已添加实测出口 IP，Harry 已完成密钥本机录入并提供五人名单，发件复用既有简报邮箱及 Keychain。当前无需外部人员新增配置。若运营商后续变更 IP，程序停止取数并提示维护者，届时才需要管理员更新名单。

## 备选：复用团队已有的常开服务器

已核对 `new-bee.club` 的 GitHub Pages 设置：发布源是 `main` 分支根目录，官网 DNS 指向 GitHub Pages。它能继续提供公开网页，却不能运行需要密钥和定时任务的公众号采集程序。若团队已有一台常开 Linux 服务器，有稳定公网出口 IP、HTTPS 和安全的密钥存放能力，本看板可直接部署到那台服务器，再把 `stats.new-bee.club` 指向它。这样无需注册新云账号，也不改变当前官网托管。

目前尚未发现或获得这类现成服务器的访问权限，所以不能假设它存在。

## 没有现成主机时：Oracle Cloud Always Free 云主机

在免费额度内用一台小型 Linux 虚拟机运行每日采集、内部登录看板和私有数据库。Oracle 官方列有长期免费的 VM、存储与公网 IP。实例运行期间的公网 IP 可用于公众号白名单；若账户内可免费保留一个固定公网 IP，就优先使用保留地址，避免机器重建时重新配置。AppSecret 只存服务端，不进网页、聊天或公开仓库。看板验证后把 `stats.new-bee.club` 指向该机器，并用免费 HTTPS 证书。

此路线没有月度订阅费，但**不能保证免费资源随时有货或永不回收**：Oracle 明确说明，免费实例所在区域可能暂时没有容量；长期低负载的免费机器也可能被回收。注册通常需要手机号和信用卡，Oracle 说明未升级付费账号时不会因注册本身扣费。还需要我们自己负责系统更新、备份和故障恢复。主机若被回收，看板必须显示同步中断；不能把旧数据冒充今日数据。

## 比较过的方案

| 方案 | 结论 |
| --- | --- |
| NewBee Mac Mini + 每周邮件 | 当前首选；无需新增云主机、网页或域名。需要验证出口 IP 的稳定性，并配置公众号名单及发件邮箱。 |
| 团队已有常开 Linux 服务器 | 优先复用；只要有稳定公网出口 IP、HTTPS 和安全的密钥存放能力，就不需要新云账号。 |
| Cloudflare 免费 Workers／Pages | 可提供网页、定时任务和 D1 数据库，且 Python Workers 已支持 Django；但公众号 API 需要将调用方出口 IP 加入白名单。免费方案没有可保证的专属固定出口 IP，现有 SQLite 与定时任务也需改造，不能直接替代采集主机。Cloudflare 可用于 `stats.new-bee.club` 的域名与访问入口，后端仍复用有稳定出口 IP 的机器。 |
| Oracle Always Free | 若无现成主机，可在免费额度内同时承载定时采集和私有看板；需确认账号资格、可用容量、公网 IP 及长期运行状态。 |
| 现有 GitHub Pages | 继续承载公开官网；不能私密保存公众号密码或定时采集。 |
| 腾讯云微搭免费体验版 | 免费档没有固定出口 IP、微信生态连接器或自定义域名；不满足本方案的完整条件。 |
| 微信云调用／CloudBase | 公众号集成文档仍要求配置网关出口 IP；云函数若主动调用公众号 API，还需开启固定出口 IP 并加入白名单。账号资格、费用和本账号接口权限尚未验证，不能当成免 IP 的免费替代方案。 |
| 现有 Vercel/Supabase 看板 | 前端可复用设计；Supabase Edge Functions 无固定出口 IP。Vercel Pro 的 Static IPs 附加项标价 100 美元/项目/月，另有 Pro 订阅及传输费用。 |
| Railway Pro | 技术上合适但需 20 美元/月订阅，含资源用量抵扣；仅在免费路线无法稳定运行且用户另行决定时考虑。 |

## 一次性外部动作（已完成的历史清单）

1. Harry：提供周报发件邮箱授权、收件邮箱名单和一位维护者收件邮箱；只在 Mac Mini 本机安全录入密码或授权码。
2. 公众号管理员 DAVID：按开发侧在部署当天提供的 Mac Mini 出口 IP 设置白名单；如果旧 AppSecret 确实无法取得且确认没有旧系统使用，再重置一次，并在本机安全保存新密钥。运营人员无需研究技术配置。
3. 当前邮件方案无需 Pin 修改官网域名；只有重新选择网页看板时才需要 `stats.new-bee.club` 记录。

## 开通前准备与实际结果

- 已完成采集器、数据表、图表邮件、任务与备份；模拟响应测试及真实官方调用均已验证。当前所有正式周期发送记录为 0，等待 10-05 首期。
- 已形成[管理员操作清单](admin-handoff.md)；实际公网 IP 及 Mac Mini 上的私有密钥配置须在启用定时任务前完成，不预填假值。
- 若使用 Oracle，在控制台实际显示免费资格和价格前，不创建可能收费的资源；若免费资源无法取得，保留可迁移部署包，不自动改用付费平台。

## 官方依据

- [腾讯云：公众号 API 与 IP 白名单](https://cloud.tencent.com/document/product/1301/100187)
- [Cloudflare：Workers 免费额度与定时任务](https://developers.cloudflare.com/workers/platform/pricing/)
- [Cloudflare：Django 支持](https://developers.cloudflare.com/workers/languages/python/packages/django/)
- [Cloudflare：专属固定出口 IP 仅限企业级附加服务](https://developers.cloudflare.com/cloudflare-one/traffic-policies/egress-policies/dedicated-egress-ips/)
- [腾讯云：CloudBase 公众号集成与出口 IP](https://docs.cloudbase.net/integration/wechat-official-oauth)
- [Oracle：Always Free 资源、容量和回收规则](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)
- [Oracle：免费账号注册与信用卡说明](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier.htm)
- [Oracle：公网 IP 类型](https://docs.oracle.com/en-us/iaas/Content/Network/Tasks/managingpublicIPs.htm)
- [腾讯云：免费档功能对照](https://cloud.tencent.com/document/product/1301/133852)
- [Supabase：Edge Functions 无固定出口 IP](https://supabase.com/docs/guides/troubleshooting/why-supabase-edge-functions-cannot-provide-static-egress-ips-for-whitelisting-3d78b0)
- [Vercel：Static IPs 价格](https://vercel.com/pricing)
- [Railway：价格与资源抵扣](https://docs.railway.com/pricing/plans)
