# 内部数据看板的运行方案（待开通）

日期：2026-09-29。此文只确定可执行方案，不代表已经购买、部署或接入公众号。

## 已知条件

- 官网 `new-bee.club` 是 GitHub Pages 静态站；GitHub 协作者权限不提供私密存储、定时服务或域名 DNS 权限。
- 公众号官方数据接口要求调用方的出口 IP 在账号后台白名单中。页面 JavaScript、GitHub Pages 和普通无固定出口 IP 的函数不适合直接持有 AppSecret 或调用接口。
- 看板需内部登录、每天自动同步、保留历史数据和同步状态，使用 `stats.new-bee.club`。首期仅公众号与视频号；普通创作者视频号接口仍待腾讯官方答复。小红书暂缓。
- 账号运营人员反馈没有已知的其他系统接入公众号，也不知道旧 AppSecret 的保管人。重置前仍应确认是否有未被运营人员知晓的旧系统。

## 推荐：单独的 Railway Pro 项目

一个项目容纳每日采集任务、数据存储和带登录的看板。仅采集任务需要启用固定出口 IP；从 Railway 控制台取得具体地址后，交给公众号管理员按一次性步骤加入白名单。AppSecret 仅存放在服务端变量中，不发聊天、不进公开仓库、不送到浏览器。看板可先用 Railway 临时域名验证，再由域名管理员配置 `stats.new-bee.club` 的 DNS 记录。

选择原因：Railway 官方文档明确 Pro 服务可启用 Static Outbound IPs，Pro 订阅为 20 美元/月，含 20 美元资源用量抵扣；实际超额用量另计。自定义域名自动配 HTTPS，但需要配置 CNAME 和 TXT 两条记录。付费开通必须在代码、预估资源和操作清单完成后由账号所有者决定。

## 比较过的方案

| 方案 | 结论 |
| --- | --- |
| 现有 GitHub Pages | 只能放公开静态页面，不能安全保管密钥或定时采集。 |
| 现有 Vercel/Supabase 看板 | 前端可复用设计；Supabase Edge Functions 没有固定出口 IP。Vercel Pro 的 Static IPs 附加项目前标价 100 美元/项目/月，另有 Pro 订阅及传输费用，对当前规模偏贵。 |
| 腾讯云微搭 | 官方已有公众号 API 方法、定时任务和身份认证能力；但其自定义域名说明要求域名已备案且需购买相应套餐。当前域名和成本条件未核实，暂不选为主方案。 |
| Railway Pro | 固定出口 IP、服务端变量和自定义域名可在同一平台完成，月费门槛相对低；需建立项目、配置账单和 DNS。 |

## 一次性外部动作（等开发侧准备完成后）

1. Harry/Pin：决定是否使用上述托管服务并由谁持有项目及账单；确认内部看板的查看人员。
2. 公众号管理员 DAVID：按开发侧给出的具体 IP 和步骤设置白名单；如果旧 AppSecret 确实无法取得且确认没有旧系统使用，再重置一次，并在安全配置界面直接保存新密钥。运营人员无需研究这些技术项。
3. 域名管理员：按托管平台实际给出的记录值，为 `stats.new-bee.club` 添加 CNAME 与验证 TXT。记录值必须在项目创建后生成，不能预先猜测。

## 开通前开发侧完成

- 采集代码只调用已授权的官方只读接口；先验证一日数据和账号权限，再打开每日任务。
- 私有数据表、登录、备份、同步失败告警与看板缺失值状态完成并本地验证。
- 形成一页管理员操作清单，写明点击位置、实际 IP、密钥录入位置和回退方法；不要求运营人员做技术判断。

## 官方依据

- [腾讯云：公众号 API 与 IP 白名单](https://cloud.tencent.com/document/product/1301/100187)
- [Railway：Static Outbound IPs](https://docs.railway.com/networking/static-outbound-ips)
- [Railway：价格与资源抵扣](https://docs.railway.com/pricing/plans)
- [Railway：自定义域名与 DNS 记录](https://docs.railway.com/networking/domains/working-with-domains)
- [Supabase：Edge Functions 无固定出口 IP](https://supabase.com/docs/guides/troubleshooting/why-supabase-edge-functions-cannot-provide-static-egress-ips-for-whitelisting-3d78b0)
- [Vercel：Static IPs 价格](https://vercel.com/pricing)
- [腾讯云微搭：自定义域名要求](https://cloud.tencent.com/document/product/1301/70110)
